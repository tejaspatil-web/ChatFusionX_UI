import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './components/chat/chat.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../modules/material.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
    ChatRoutingModule,
    FormsModule,
    MaterialModule,
    SharedModule,
  ],
  exports: [ChatComponent],
})
export class ChatModule {}
