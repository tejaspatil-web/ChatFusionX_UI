import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;
  public userMessage: string = '';
  public messages = [];
  constructor(
    private _chatService: ChatService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.openDialog();
    this._chatService.joinChatRoom();
    this.getUserMessages();
    this.getChatHistory();
  }

  openDialog(): void {
    if (!localStorage.getItem('userId')) {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: {},
        width: '365px',
        height: '290px',
        disableClose: true,
      });
    }
  }

  sendMessage() {
    if (this.userMessage !== '') {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const message = {
        userName: 'You',
        userMessage: this.userMessage,
        time: currentTime,
      };
      this.messages.push(message);
      const payload = {
        userName: localStorage.getItem('userName'),
        userId: localStorage.getItem('userId'),
        userMessage: this.userMessage,
        time: currentTime,
      };
      this._chatService.sendMessage(JSON.stringify(payload));
      this.userMessage = '';
      this.scrollToBottom();
    }
  }

  getChatHistory() {
    const config = new MatSnackBarConfig();
    // config.duration = 2000; // Duration in milliseconds
    config.verticalPosition = 'top';
    config.panelClass = ['center-text'];
    this._snackBar.open('Waiting for connection...', '', config);
    this._chatService.getChatHistory().subscribe((data: any) => {
      this.messages = data;
      this.messages.forEach((ele) => {
        if (localStorage.getItem('userId') === ele.userId) {
          ele.userName = 'You';
        }
      });
      this._snackBar.dismiss();
    });
  }

  getUserMessages() {
    this._chatService.getUsersMessage().subscribe((messages) => {
      const userMessage = JSON.parse(messages);
      this.messages.push(userMessage);
    });
  }

  scrollToBottom(): void {
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
  }
}
