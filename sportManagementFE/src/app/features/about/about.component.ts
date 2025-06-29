import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  constructor(public translate: TranslateService) {
    // Optional: log current language or use for future logic
    console.log('Current lang:', translate.currentLang);
  }
}
