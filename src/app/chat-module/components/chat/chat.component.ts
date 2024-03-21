import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;
  userMessage:string=''
  constructor(private _chatService:ChatService){}
messages = [
  { sender: 'John', message: 'Hey there!', time: '10:00 AM' },
  { sender: 'Jane', message: 'Hi John! How are you?', time: '10:05 AM' },
  { sender: 'John', message: 'I\'m good, thanks! How about you?', time: '10:10 AM' },
  { sender: 'Jane', message: 'I\'m great, thanks for asking!', time: '10:15 AM' },
  { sender: 'John', message: 'Hey there!', time: '10:00 AM' },
  { sender: 'Jane', message: 'Hi John! How are you?', time: '10:05 AM' },
  { sender: 'John', message: 'I\'m good, thanks! How about you?', time: '10:10 AM' },
  { sender: 'Jane', message: 'I\'m great, thanks for asking!', time: '10:15 AM' },
  { sender: 'John', message: 'Hey there!', time: '10:00 AM' },
  { sender: 'Jane', message: 'Hi John! How are you?', time: '10:05 AM' },
  { sender: 'John', message: 'I\'m good, thanks! How about you?', time: '10:10 AM' },
  { sender: 'Jane', message: 'I\'m great, thanks for asking!', time: '10:15 AM' },
];

ngOnInit(){
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  this._chatService.joinChatRoom({sender: 'Tejas', message: this.userMessage, time: currentTime})
}
sendMessage() {
  if(this.userMessage !== ''){
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const message = {sender: 'You', message: this.userMessage, time: currentTime }
    this.messages.push(message)
    this._chatService.sendMessage(message)
    this.userMessage = ''
    this.scrollToBottom()
  }
}

scrollToBottom(): void {
  this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
}

}
