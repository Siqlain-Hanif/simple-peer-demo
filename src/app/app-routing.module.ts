import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { PeerCallComponent } from './peer-call/peer-call.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'peer/:id', component: PeerCallComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }