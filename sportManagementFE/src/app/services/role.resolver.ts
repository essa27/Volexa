import { Injectable } from '@angular/core';
import { Resolve }    from '@angular/router';
import { AuthService } from 'src/app/features/auth/auth.service';
import { take }       from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RoleResolver implements Resolve<string> {
  constructor(private auth: AuthService) {}

  resolve() {
   
    return this.auth.getUserRole().pipe(take(1));
  }
}
