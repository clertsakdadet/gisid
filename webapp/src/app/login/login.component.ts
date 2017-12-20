import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'gisid-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  host: {
    class: 'gisid-login'
  }
})
export class LoginComponent implements OnInit {
  public credential: Credential = { USERNAME: 'testuser', PASSWORD: 'usertest' };

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) { }

  ngOnInit() {

  }

  login() {
    this.auth.login().subscribe(() => {
      if (this.auth.isLoggedIn) {
        // Get the redirect URL from our auth service
        // If no redirect has been set, use the default
        let redirect = this.auth.redirectUrl ? this.auth.redirectUrl : '/';

        // Redirect the user
        this.router.navigate([redirect]);
      }
    });
  }

  //ui action
  loginSubmit() {

  }

  facebookLoginSubmit() {
    console.log('facebook')
    this.http.get('http://dev.cdg.co.th/g/auth/facebook')
      .subscribe((data: any) => {
        console.log('facebook data', data);
      },
      (error: any) => {
        console.log('error',error);
      }, () => {
        console.log('undefied')
      }
    );
  }

  googleLoginSubmit() {

  }

}

interface Credential {
  USERNAME: string;
  PASSWORD: string;
}
