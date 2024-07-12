import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { RouterLink, RouterModule, RouterOutlet, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MaterialModule } from './shared/modules/material.module';
import { AppRoutesModule } from './app.routes';

@NgModule({
  declarations: [AppComponent, DashboardComponent],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutesModule,
    MaterialModule
  ],
  providers: [provideHttpClient()],
  bootstrap: [ AppComponent ]
})
  
export class AppModule { }
