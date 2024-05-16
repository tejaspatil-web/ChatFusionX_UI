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

  joinFusionXChatRoom() {
    this._socket.emit('joinRoom', 'fusionChatX');
  }

  onSocketForGetUsersMessage() {
    this._socket.on('message', (message: string) => {
      this._userMessages.next(message);
    });
  }

  getUsersMessage() {
    return this._userMessages.asObservable();
  }

  sendMessageInFusionXChat(data: any) {
    this._socket.emit('message', 'fusionChatX', data);
  }

  getUserId(userName) {
    return this._http.get(`${this._url}/api/user/username/${userName}`);
  }

  getChatHistory(userId: string) {
    return this._http.get(
      `${this._url}/api/user/getChatHistory/userId/${userId}`
    );
  }

  updateUserName(userId: string, updatedName: string) {
    return this._http.put(`${this._url}/api/user/updateUserName/${userId}`, {
      userName: updatedName,
    });
  }

  deleteChat(chatId: string, userId: string) {
    return this._http.delete(
      `${this._url}/api/user/deleteChat/chatId/${chatId}/userId/${userId}`
    );
  }
}
