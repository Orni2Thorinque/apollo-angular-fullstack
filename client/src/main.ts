import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import * as dotenv from 'dotenv';
import 'zone.js/dist/zone'; // Included with Angular CLI.
import { CycloMapModule } from './app/components/cyclo-map.module';

// dotenv.config();
// export const GMAP_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

platformBrowserDynamic()
  .bootstrapModule(CycloMapModule)
  .catch(err => console.error(err));
