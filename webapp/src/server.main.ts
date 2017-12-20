import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';
if (environment.production) {  
   enableProdMode();
} 

export { ServerAppModule } from './app/server.app.module';
