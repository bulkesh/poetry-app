import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PoetryComponent } from '../poetry/poetry.component'

const routes: Routes = [
  { path:'**', redirectTo: '/poetry', pathMatch: 'full'},
  { path: '', redirectTo: '/poetry', pathMatch: 'full'},
  { path:'poetry',component: PoetryComponent},
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
