import { AppModule } from './app.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//Installed separatly
import { ServerModule } from '@angular/platform-server';

import { AppComponent } from './app.component';

import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

@NgModule({
    declarations: [],
    imports: [
        //Make sure the string matches
        BrowserModule.withServerTransition({
            appId: 'my-app-id'
        }),
        ServerModule,
        AppModule,
        ModuleMapLoaderModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class ServerAppModule {}