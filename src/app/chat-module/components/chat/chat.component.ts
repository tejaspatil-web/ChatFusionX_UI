import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SharedService } from 'src/app/shared/services/shared-service/shared-service.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;
  @Input() isGroupsCompo: boolean = false;
  public userMessage: string = '';
  public messages = [];
  public firstName: string = '';
  public lastName: string = '';
  public userId: string = '';
  public isProfileButtonActive: boolean = true;
  public isSendMsgButtonActive: boolean = true;
  public isAdminUser: boolean = false;
  constructor(
    private _chatService: ChatService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _sharedService: SharedService
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.openDialog('first-load');
    this.firstName = localStorage.getItem('firstName');
    this.lastName = localStorage.getItem('lastName');
    this.userId = localStorage.getItem('userId');
    if (this.userId) {
      this._chatService.joinChatRoom();
      this.getUserMessages();
      this.getChatHistory();
    }
    this.getUpdatedUserDetails();
  }

  getUpdatedUserDetails() {
    this._sharedService.getUserDetails().subscribe((userData: any) => {
      this.firstName = userData.firstName;
      this.lastName = userData.lastName;
      this.userId = userData.userId;
    });
  }

  openDialog(type: string): void {
    switch (type) {
      case 'first-load':
        if (!localStorage.getItem('userId')) {
          const dialogRef = this.dialog.open(DialogComponent, {
            data: { type: 'first-load' },
            width: '365px',
            height: '290px',
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe((status) => {
            if (status) {
              this.firstName = localStorage.getItem('firstName');
              this.lastName = localStorage.getItem('lastName');
              this.userId = localStorage.getItem('userId');
              this._chatService.joinChatRoom();
              this.getUserMessages();
              this.getChatHistory();
              this._sharedService.setUserDetails({
                firstName: this.firstName,
                lastName: this.lastName,
                userId: this.userId,
              });
            }
          });
        }
    }
  }

  openSnackBar(message: string, time: number) {
    const config = new MatSnackBarConfig();
    config.duration = time; // Duration in milliseconds
    config.verticalPosition = 'top';
    config.panelClass = ['center-text'];
    this._snackBar.open(message, '', config);
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

      this.messages[0].isAdmin
        ? this.messages.push({ ...message, isAdmin: true })
        : this.messages.push(message);
      const firstName = localStorage.getItem('firstName');
      const lastName = localStorage.getItem('lastName');
      const payload = {
        userName: `${firstName} ${lastName}`,
        userId: localStorage.getItem('userId'),
        userMessage: this.userMessage,
        time: currentTime,
      };
      this._chatService.sendMessage(JSON.stringify(payload));
      this.userMessage = '';
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });
    }
  }

  getChatHistory() {
    this.openSnackBar('Waiting for connection...', 0);
    this._chatService.getChatHistory(this.userId).subscribe((data: any) => {
      this.messages = data;
      this.messages.forEach((ele) => {
        if (this.userId === ele.userId) {
          ele.userName = 'You';
        }
      });
      this._snackBar.dismiss();
      this.isProfileButtonActive = false;
      this.isSendMsgButtonActive = false;
      requestAnimationFrame(() => {
        this.scrollToBottom();
      });
    });
  }

  getUserMessages() {
    this._chatService.getUsersMessage().subscribe((messages) => {
      const userMessage = JSON.parse(messages);
      this.messages.push(userMessage);
    });
  }

  deleteMessage(chatId: string) {
    this._chatService.deleteChat(chatId, this.userId).subscribe({
      next: (res: any) => {
        this.openSnackBar(res.message, 2000);
        this.messages = this.messages.filter((ele) => {
          return ele._id !== chatId;
        });
      },
      error: (error) => {
        this.openSnackBar(error.message, 2000);
      },
    });
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTo({
        top: this.scrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    } catch (err) {}
  }

  ngOnDestroy(): void {
    this.isGroupsCompo = false;
  }
}
