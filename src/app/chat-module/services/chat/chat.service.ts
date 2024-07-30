import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _socket: Socket;
  // private _url: string = 'https://chatfusionx-api.onrender.com';
  private _url: string = 'http://localhost:8080';
  private _userMessages: Subject<string> = new Subject();

  constructor(private _http: HttpClient) {
    this._socket = io(this._url);
  }

  getAiResponse(prompt: string, history) {
    const userMessage = { prompt: prompt, history: history };
    return this._http.post(`${this._url}/api/genai/getAiResponse`, userMessage);
  }

  getUserId(userName) {
    return this._http.get(`${this._url}/api/user/username/${userName}`);
  }

  login(userDetails) {
    this._socket.emit(
      'login',
      userDetails.userId,
      `${userDetails.firstName} ${userDetails.lastName}`
    );
  }

  groupList(userId: string) {
    this._socket.emit('groupList', userId);
  }

  groupCount(userId: string) {
    this._socket.emit('groupCount', userId);
  }

  createGroup(groupName: string, userId: string): void {
    this._socket.emit('createGroup', groupName, userId);
  }

  getGroupMessages(groupId: string) {
    this._socket.emit('getGroupMessages', groupId);
  }

  sendMessage(messageData: any): void {
    this._socket.emit('message', messageData);
  }

  inviteUser(groupId: string, userId: string, userName: string): void {
    this._socket.emit('inviteUser', groupId, userId, userName);
  }

  readAllMessages(userId: string, groupId: string): void {
    this._socket.emit('readMessages', { userId, groupId });
  }

  // Listen to events
  onEvent(event: string): Observable<any> {
    return new Observable<any>((observer) => {
      this._socket.on(event, (data) => observer.next(data));
    });
  }

  onMessage(): Observable<any> {
    return this.onEvent('message');
  }

  onGroupMessages(): Observable<any> {
    return this.onEvent('groupMessages');
  }

  onGroupList() {
    return this.onEvent('getGroupsList');
  }

  getGroupCount() {
    return this.onEvent('getGroupsCount');
  }

  onUnreadMessageCount(): Observable<any> {
    return this.onEvent('unreadCount');
  }

  onGroupDetails(): Observable<any> {
    return this.onEvent('groupsDeatils');
  }

  onGroupCreate(): Observable<any> {
    return this.onEvent('groupCreated');
  }

  onNewMember(): Observable<any> {
    return this.onEvent('newMember');
  }

  onError(): Observable<any> {
    return this.onEvent('error');
  }

  joinFusionXChatRoom() {
    this._socket.emit('joinChatFusionXRoom', 'fusionChatX');
  }

  onSocketForGetChatFusionXUsersMessage() {
    this._socket.on('chatFusionXMessage', (message: any) => {
      this._userMessages.next(message);
    });
  }

  getChatFusionXUsersMessage() {
    return this._userMessages.asObservable();
  }

  sendMessageInFusionXChat(data: any) {
    this._socket.emit('chatFusionXMessage', 'fusionChatX', data);
  }

  getChatFusionXHistory(userId: string) {
    return this._http.get(
      `${this._url}/api/chat/getChatHistory/userId/${userId}`
    );
  }

  deleteChatFusionXChat(chatId: string, userId: string) {
    return this._http.delete(
      `${this._url}/api/chat/deleteChat/chatId/${chatId}/userId/${userId}`
    );
  }

  updateUserName(userId: string, updatedName: string) {
    return this._http.put(`${this._url}/api/user/updateUserName/${userId}`, {
      userName: updatedName,
    });
  }
}
