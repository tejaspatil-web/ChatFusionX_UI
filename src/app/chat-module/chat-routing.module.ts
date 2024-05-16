import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { GroupsComponent } from './components/groups/groups.component';

const routes: Routes = [
  {
    path: 'chatfusionx',
    children: [
      {
        path: '',
        redirectTo: 'chat', // Redirect to chat by default
        pathMatch: 'full',
      },
      { path: 'chat', component: ChatComponent },
      { path: 'groups/:id', component: GroupsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatRoutingModule {}
