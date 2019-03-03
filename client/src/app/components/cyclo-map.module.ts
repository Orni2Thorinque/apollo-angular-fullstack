import { AgmCoreModule, InfoWindowManager, GoogleMapsAPIWrapper, MarkerManager } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxFloatButtonModule } from 'ngx-float-button';
import { GraphQLModule } from '../apollo-client/graphql.module';
import { CycloMapComponent } from './cyclo-map.component';
import { MaterialModule } from '../shared/material.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [CycloMapComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    GraphQLModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCe1m6MzJvBw-2Wd4SDmimVv5vM4av0YVU',
    }),
    MaterialModule,
    NgxFloatButtonModule,
    NgxSpinnerModule,
  ],
  providers: [GoogleMapsAPIWrapper, InfoWindowManager, MarkerManager],
  bootstrap: [CycloMapComponent],
})
export class CycloMapModule {
  constructor() {}
}
