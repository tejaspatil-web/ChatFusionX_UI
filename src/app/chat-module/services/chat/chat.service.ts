import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _socket: Socket;
  private _url: string = 'https://chatfusionx-api.onrender.com';
  // private _url: string = 'http://localhost:8080';
  private _userMessages: Subject<string> = new Subject();

  constructor(private _http: HttpClient) {
    this._socket = io(this._url);
  }

  joinChatRoom() {
    this._socket.emit('joinRoom', 'fusionChatX');
  }

  getUserId(userName) {
    return this._http.get(`${this._url}/api/user/username/${userName}`);
  }

  sendMessage(data: any) {
    this._socket.emit('message', 'fusionChatX', data);
  }

  getUsersMessage() {
    this._socket.on('message', (message: string) => {
      this._userMessages.next(message);
    });
    return this._userMessages.asObservable();
  }

  getChatHistory() {
    return this._http.get(`${this._url}/api/user/getChatHistory`);
  }

  updateUserName(userId: string, updatedName: string) {
    return this._http.put(`${this._url}/api/user/updateUserName/${userId}`, {
      userName: updatedName,
    });
  }
}
