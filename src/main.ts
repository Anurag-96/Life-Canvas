
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

import { AppComponent } from './app.component';

console.log('Bootstrapping application...');
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
  ],
}).catch(err => console.error('Bootstrap error:', err));

// AI Studio always uses an `index.tsx` file for all project types.
