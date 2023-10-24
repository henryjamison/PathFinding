import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GridComponent } from './grid/grid.component';
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { NoPathComponent } from './no-path/no-path.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSliderModule} from '@angular/material/slider';
import { InfoComponent } from './info/info.component';
import { HeaderComponent } from './header/header.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { FooterComponent } from './footer/footer.component';
import { MobileMessageComponent } from './mobile-message/mobile-message.component';





@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    NoPathComponent,
    InfoComponent,
    HeaderComponent,
    FooterComponent,
    MobileMessageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSliderModule,
    MatSidenavModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
