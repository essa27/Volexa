import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private localeSubject = new BehaviorSubject<string>(this.getInitialLocale());
  locale$ = this.localeSubject.asObservable();

  private getInitialLocale(): string {
    return localStorage.getItem('locale') || 'en';
  }

  setLocale(locale: string): void {
    localStorage.setItem('locale', locale);
    this.localeSubject.next(locale);
  }

  getCurrentLocale(): string {
    return this.localeSubject.getValue();
} }
