import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { appRoutingProviders } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [appRoutingProviders,provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(withFetch()), provideClientHydration(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync()]
};
