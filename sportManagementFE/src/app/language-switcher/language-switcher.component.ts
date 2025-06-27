import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from '../services/locale.service';
@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent {
  menuOpen = false;

  get currentLang(): string {
    return this.translate.currentLang;
  }

  constructor(
    private translate: TranslateService,
    private localeService: LocaleService
  ) {
    this.translate.addLangs(['en', 'ro']);
    const savedLang = localStorage.getItem('lang') || 'ro';
    this.translate.setDefaultLang('ro');
    this.translate.use(savedLang);
  }
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.localeService.setLocale(lang);
    localStorage.setItem('lang', lang);
    this.menuOpen = false;
    window.location.reload();
  }
  

  getLangLabel(lang: string): string {
    return lang === 'ro' ? 'Română' : 'English (US)';
  }

  getFlagEmoji(lang: string): string {
    return lang === 'ro' ? '🇷🇴' : '🇺🇸';
  }
}
