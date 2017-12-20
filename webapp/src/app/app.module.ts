import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FlexLayoutModule } from "@angular/flex-layout";

import { AppComponent } from './app.component';

import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { ServerModule } from '@angular/platform-server';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { LoginComponent } from './login/login.component';
import { MaterialUIModule } from './material-ui-module/material-ui.module';
import { MainModule } from './main-module/main.module';
import { AppService } from './app.service';
import { AppToolbarComponent } from './app-toolbar/app-toolbar.component';
import { RegisterComponent } from './register/register.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AppToolbarComponent,
    RegisterComponent,
    ],
  imports: [
    MainModule,
    BrowserModule.withServerTransition({
      appId: 'webapp'
    }),
    FormsModule,    
    HttpModule,
    AppRoutingModule,
    MaterialUIModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FlexLayoutModule, //responsive API
    HttpClientModule // http request API
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
