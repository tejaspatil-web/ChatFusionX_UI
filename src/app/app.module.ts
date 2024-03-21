import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatModule } from './chat-module/chat.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [FormsModule,BrowserModule, AppRoutingModule, ChatModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
