import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { delay, tap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  isLoggedIn: boolean = false;

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  constructor(private router: Router) {}

  login(): Observable<boolean> {
    return of(true).pipe(delay(1000), tap(val => this.isLoggedIn = val));
  }

  logout() {
    this.isLoggedIn = false;
    window.location.href = '/';
  }
}
