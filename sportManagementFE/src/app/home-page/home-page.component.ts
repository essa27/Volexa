import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  scrollToContent(): void {
    const section = document.querySelector('.features');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
