import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GridComponent } from './grid/grid.component';
import { InfoComponent } from './info/info.component';

const routes: Routes = [
  {path: 'grid', component: GridComponent},
  {path: 'info', component: InfoComponent},
  {path: '', component: InfoComponent},
  { path: '**', component: InfoComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
