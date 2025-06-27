import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/features/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

interface Strategy {
  id: number;
  name: string;
  filename: string;
  uploadedAt: string;
}

@Component({
  selector: 'app-coach-board',
  templateUrl: './coach-board.component.html',
  styleUrls: ['./coach-board.component.scss']
})
export class CoachBoardComponent implements AfterViewInit, OnInit {
  @ViewChild('bgCanvas') bgCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('strategyCanvas') drawCanvasRef!: ElementRef<HTMLCanvasElement>;

  strategies: Strategy[] = [];
  private bgCtx!: CanvasRenderingContext2D;
  private drawCtx!: CanvasRenderingContext2D;
  private drawing = false;

  penColor = '#000000';
  penWidth = 4;
  eraserSize = 20;
  mode: 'draw' | 'erase' = 'draw';
  apiUrl = 'http://localhost:8080/api/strategy';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadStrategies();
  }

  ngAfterViewInit(): void {
    this.initCanvasContexts();
    this.resizeCanvas();

    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  private initCanvasContexts(): void {
    this.bgCtx = this.bgCanvasRef.nativeElement.getContext('2d')!;
    this.drawCtx = this.drawCanvasRef.nativeElement.getContext('2d')!;
    this.drawCtx.lineCap = 'round';
  }
  private resizeCanvas(): void {
    const bgCanvas = this.bgCanvasRef.nativeElement;
    const drawCanvas = this.drawCanvasRef.nativeElement;
    const container = drawCanvas.parentElement!;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
  
    // Set internal pixel size
    bgCanvas.width = drawCanvas.width = rect.width * dpr;
    bgCanvas.height = drawCanvas.height = rect.height * dpr;
  
    // Set CSS size
    bgCanvas.style.width = drawCanvas.style.width = `${rect.width}px`;
    bgCanvas.style.height = drawCanvas.style.height = `${rect.height}px`;
  
    // Get contexts and scale
    this.bgCtx = bgCanvas.getContext('2d')!;
    this.drawCtx = drawCanvas.getContext('2d')!;
    this.bgCtx.scale(dpr, dpr);
    this.drawCtx.scale(dpr, dpr);
    this.drawCtx.lineCap = 'round';
  
    this.loadCourtImage();
    this.setupDrawing(drawCanvas);
  }
  
  

  private loadCourtImage(): void {
    const image = new Image();
    image.src = 'assets/volleyball-court.png';
  
    image.onload = () => {
      const canvas = this.bgCanvasRef.nativeElement;
      const rect = canvas.getBoundingClientRect();
      this.bgCtx.drawImage(image, 0, 0, rect.width, rect.height);
    };
  }
  

  private setupDrawing(canvas: HTMLCanvasElement) {
    // Remove old listeners to avoid stacking
    canvas.removeEventListener('mousedown', this.handleMouseDown);
    canvas.removeEventListener('mousemove', this.handleMouseMove);
    canvas.removeEventListener('mouseup', this.handleMouseUp);
    canvas.removeEventListener('mouseleave', this.handleMouseLeave);

    // Add new listeners
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('mouseleave', this.handleMouseLeave);
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.isCoachOrAdmin()) return;
    this.drawing = true;
    this.drawCtx.beginPath();
    this.drawCtx.moveTo(e.offsetX, e.offsetY);

    if (this.mode === 'draw') {
      this.drawCtx.strokeStyle = this.penColor;
      this.drawCtx.lineWidth = this.penWidth;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.drawing) return;

    if (this.mode === 'erase') {
      this.drawCtx.clearRect(
        e.offsetX - this.eraserSize / 2,
        e.offsetY - this.eraserSize / 2,
        this.eraserSize,
        this.eraserSize
      );
    } else {
      this.drawCtx.lineTo(e.offsetX, e.offsetY);
      this.drawCtx.stroke();
    }
  };

  private handleMouseUp = () => {
    this.drawing = false;
  };

  private handleMouseLeave = () => {
    this.drawing = false;
  };

  setMode(mode: 'draw' | 'erase') {
    this.mode = mode;
  }

  clearCanvas() {
    const canvas = this.drawCanvasRef.nativeElement;
    this.drawCtx.clearRect(0, 0, canvas.width, canvas.height);
  }

  saveCanvas() {
    const bgCanvas = this.bgCanvasRef.nativeElement;
    const drawCanvas = this.drawCanvasRef.nativeElement;

    const strategyName = prompt(this.translate.instant('STRATEGY.ENTER_NAME'));
    if (!strategyName || strategyName.trim() === '') {
      alert(this.translate.instant('STRATEGY.NAME_REQUIRED'));
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = bgCanvas.width;
    tempCanvas.height = bgCanvas.height;

    const ctx = tempCanvas.getContext('2d')!;
    ctx.drawImage(bgCanvas, 0, 0);
    ctx.drawImage(drawCanvas, 0, 0);

    tempCanvas.toBlob((blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append('file', blob, 'strategy.png');
        formData.append('name', strategyName.trim());

        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });

        this.http.post(`${this.apiUrl}/upload`, formData, { headers }).subscribe({
          next: (res: any) => {
            alert(res.message || this.translate.instant('STRATEGY.SAVE_SUCCESS'));
            this.loadStrategies();
          },
          error: (err) =>
            alert(this.translate.instant('STRATEGY.UPLOAD_FAILED') + err.message)
        });
      }
    }, 'image/png');
  }

  loadStrategies() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<Strategy[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => (this.strategies = data),
      error: (err) => console.error('❌ Could not load strategies', err)
    });
  }

  deleteStrategy(id: number) {
    if (!confirm(this.translate.instant('STRATEGY.CONFIRM_DELETE'))) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.delete(`${this.apiUrl}/${id}`, { headers }).subscribe({
      next: () => {
        this.strategies = this.strategies.filter((s) => s.id !== id);
        alert(this.translate.instant('STRATEGY.DELETE_SUCCESS'));
      },
      error: () =>
        alert(this.translate.instant('STRATEGY.DELETE_FAILED'))
    });
  }

  getImageUrl(filename: string): string {
    return `${this.apiUrl}/image/${filename}`;
  }

  isCoachOrAdmin(): boolean {
    return this.authService.isCoach() || this.authService.isAdmin();
  }
}
