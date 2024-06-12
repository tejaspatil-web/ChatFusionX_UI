import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared/services/shared-service/shared-service.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  public isBasePathRoute: boolean = true;
  private _userId: string = '';
  private _firstName: string = '';
  private _lastName: string = '';
  private _isLoadFirsTime: boolean = true;
  private _firstLoadUrlPath: string = '';
  private _onGroupMessageSubscription: Subscription = new Subscription();
  constructor(
    private _chatService: ChatService,
    private _router: Router,
    public dialog: MatDialog,
    private _sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this._userId = localStorage.getItem('userId');
    this._firstName = localStorage.getItem('firstName');
    this._lastName = localStorage.getItem('lastName');

    if (!localStorage.getItem('userId')) {
      this.openDialog('first-load');
    } else {
      this.setGroupLogin();
      this.getAllChatMessages();
    }

    //On chatFusionX group connection
    this._chatService.joinFusionXChatRoom();
    this._chatService.onSocketForGetChatFusionXUsersMessage();
    //get active route path
    this.getActiveRoutePath();
    this.onUserJoinToNewGroup();
  }

  setGroupLogin() {
    this._chatService.login({
      firstName: this._firstName,
      lastName: this._lastName,
      userId: this._userId,
    });
  }

  getActiveRoutePath() {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Check if the current route path is the base path ('/')
        this.isBasePathRoute = event.url === '/';
        if (this._isLoadFirsTime) this.setUserRoutePath();
      });
  }

  openDialog(type: string): void {
    switch (type) {
      case 'first-load':
        if (!localStorage.getItem('userId')) {
          const dialogRef = this.dialog.open(DialogComponent, {
            data: { type: 'first-load' },
            width: '300px',
            height: '275px',
            disableClose: true,
          });
          dialogRef.afterClosed().subscribe((status) => {
            if (status) {
              this._firstName = localStorage.getItem('firstName');
              this._lastName = localStorage.getItem('lastName');
              this._userId = localStorage.getItem('userId');
              this._sharedService.setIsLoadFirstTimeChatCompo(true);
              this._sharedService.setUserDetails({
                firstName: this._firstName,
                lastName: this._lastName,
                userId: this._userId,
              });
              this.setUserRoutePath();
              this.setGroupLogin();
            }
          });
        }
    }
  }

  setUserRoutePath() {
    this._router.navigate(['/']);
    if (this._isLoadFirsTime) {
      this._firstLoadUrlPath = this._router.url;
    }
    this._isLoadFirsTime = false;
    if (this._firstLoadUrlPath !== '/') {
      if (this._userId && this._userId !== '') {
        const path = this._firstLoadUrlPath.split('/');
        const groupId = path[path.length - 1];
        this._chatService.inviteUser(
          groupId,
          this._userId,
          `${this._firstName} ${this._lastName}`
        );
      }
    }
  }

  onUserJoinToNewGroup() {
    this._chatService.onNewMember().subscribe((message) => {
      this._sharedService.openSnackBar(message.message, 2000);
      localStorage.setItem('groupId', message.groupId);
      localStorage.setItem('groupName', message.groupName);
      this._router.navigate([`/chatfusionx/groups/${message.groupId}`]);
    });
  }

  getAllChatMessages() {
    this._onGroupMessageSubscription = this._chatService
      .onMessage()
      .subscribe((message) => {
        const groupId = localStorage.getItem('groupId');
        const userId = localStorage.getItem('userId');
        if (
          groupId !== '' &&
          (groupId === message.groupId || message.userId === userId)
        ) {
          this._chatService.readAllMessages(userId, message.groupId);
        }
        if (
          localStorage.getItem('groupId') === '' &&
          this._userId !== message.userId
        ) {
          this._sharedService.setUnreadMessageCount(message);
        }
      });
  }

  ngOnDestroy(): void {}
}
