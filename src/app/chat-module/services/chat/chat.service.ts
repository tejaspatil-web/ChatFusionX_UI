import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private url: string = 'http://localhost:8080';

  constructor() {
    this.socket = io(this.url);
  }

  joinChatRoom(data: any) {
    this.socket.emit('join', data);
  }

  sendMessage(data: any) {
    this.socket.emit('message', data);
  }
}
