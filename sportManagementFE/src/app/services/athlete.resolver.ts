import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { AthleteService } from '../features/athletes/athlete.service';
import { Athlete }        from '../features/athletes/athlete.model';

@Injectable({ providedIn: 'root' })
export class AthleteResolver implements Resolve<Athlete> {
  constructor(private svc: AthleteService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const id = Number(route.paramMap.get('id'));
    return this.svc.getAthleteById(id);
  }
}
