import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';

const routes: Routes = [
  {
    path: 'chatmodule',
    children: [
      {
        path: '',
        redirectTo: 'chat', // Redirect to chat by default
        pathMatch: 'full',
      },
      { path: 'chat', component: ChatComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatRoutingModule {}
