import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './components/chat/chat.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../modules/material.module';
import { SharedModule } from '../shared/shared.module';
import { MainComponent } from './components/main/main.component';
import { HeaderComponent } from './components/header/header.component';
import { GroupsComponent } from './components/groups/groups.component';

@NgModule({
  declarations: [
    ChatComponent,
    MainComponent,
    HeaderComponent,
    GroupsComponent,
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    FormsModule,
    MaterialModule,
    SharedModule,
  ],
  exports: [MainComponent],
})
export class ChatModule {}
