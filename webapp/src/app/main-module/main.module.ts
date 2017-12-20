import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module'
import { FlexLayoutModule } from "@angular/flex-layout";

import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { ServerModule } from '@angular/platform-server';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';

import { MaterialUIModule } from '../material-ui-module/material-ui.module';
import { MainComponent } from './main.component'
import { AppService } from '../app.service'

@NgModule({
  declarations: [
    MainComponent,
    HomeComponent,
    ProfileComponent
    ],
  imports: [
    CommonModule,
    BrowserModule.withServerTransition({
      appId: 'webapp'
    }),
    FormsModule,    
    HttpModule,
    MaterialUIModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MainRoutingModule,
    FlexLayoutModule, //responsive API
    HttpClientModule // http request API
  ],
  providers: [AppService],
  bootstrap: [MainComponent]
})
export class MainModule { }
