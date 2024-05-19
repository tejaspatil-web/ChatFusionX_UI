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
import { SharedService } from 'src/app/shared/services/shared-service/shared-service.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;
  @Input() isGroupsCompo: boolean = false;
  @Input() groupName: string = '';
  private _getSelectedGroupChatSubscription: Subscription = new Subscription();
  public userMessage: string = '';
  public messages = [];
  public firstName: string = '';
  public lastName: string = '';
  public userId: string = '';
  private groupId: string = '';
  public isProfileButtonActive: boolean = true;
  public isSendMsgButtonActive: boolean = true;
  public isAdminUser: boolean = false;
  private _chatFusionXMsgSubscription: Subscription = new Subscription();
  private _onGroupMessageSubscription: Subscription = new Subscription();
  private _isLoadFirstTimeChatCompoSubscription: Subscription =
    new Subscription();
  constructor(
    private _activateRoute: ActivatedRoute,
    private _chatService: ChatService,
    private _sharedService: SharedService
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.firstName = localStorage.getItem('firstName');
    this.lastName = localStorage.getItem('lastName');
    this.userId = localStorage.getItem('userId');
    this.getSelectedRoutePath();
    this.getUpdatedUserDetails();
    this.getSelectedGroupChat();
    this.getGroupMessages();
    this.getIsLoadFirstTimeChatCompo();
  }

  getSelectedRoutePath() {
    if (this.userId) {
      const activatedRoute = this._activateRoute.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      if (activatedRoute === '' && !this.isGroupsCompo) {
        this.getChatFusionXUserMessages();
        this.getChatFusionXChatHistory();
      }
      const currentRoute = `/chatfusionx/${activatedRoute}`;
      const groupListRoute = `/chatfusionx/groups/${this.userId}`;
      if (currentRoute !== groupListRoute && this.isGroupsCompo) {
        const path = currentRoute.split('/');
        this.groupId = path[path.length - 1];
        this._chatService.getGroupMessages(this.groupId);
        this._chatService.joinGroup(this.groupId, this.userId);
      }
    }
  }

  getIsLoadFirstTimeChatCompo() {
    this._isLoadFirstTimeChatCompoSubscription = this._sharedService
      .getIsLoadFirstTimeChatCompo()
      .subscribe((isFirstTimeLoad) => {
        if (isFirstTimeLoad) {
          this.getChatFusionXUserMessages();
          this.getChatFusionXChatHistory();
        }
      });
  }

  getSelectedGroupChat() {
    this._getSelectedGroupChatSubscription = this._chatService
      .onGroupMessages()
      .subscribe((data) => {
        this.messages = data;
        this.messages.forEach((ele) => {
          if (ele.userId === this.userId) ele.userName = 'You';
        });
        requestAnimationFrame(() => {
          this.scrollToBottom();
        });
      });
  }

  getGroupMessages() {
    if (this.userId) {
      this._onGroupMessageSubscription = this._chatService
        .onMessage()
        .subscribe((groupMessage) => {
          if (groupMessage.userId === this.userId) {
            groupMessage.userName = 'You';
            requestAnimationFrame(() => {
              this.scrollToBottom();
            });
          }
          this.messages.push(groupMessage);
        });
    }
  }

  getUpdatedUserDetails() {
    this._sharedService.getUserDetails().subscribe((userData: any) => {
      this.firstName = userData.firstName;
      this.lastName = userData.lastName;
      this.userId = userData.userId;
    });
  }

  sendMessage() {
    if (this.userMessage !== '') {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const firstName = localStorage.getItem('firstName');
      const lastName = localStorage.getItem('lastName');
      let payload = {
        userName: `${firstName} ${lastName}`,
        userId: localStorage.getItem('userId'),
        userMessage: this.userMessage,
        time: currentTime,
        groupId: this.groupId,
      };

      if (this.isGroupsCompo) {
        this._chatService.sendMessage(payload);
      } else {
        this._chatService.sendMessageInFusionXChat(payload);
      }
      this.userMessage = '';
    }
  }

  getChatFusionXChatHistory() {
    this._sharedService.openSnackBar('Waiting for connection...', 0);
    this._chatService
      .getChatFusionXHistory(this.userId)
      .subscribe((data: any) => {
        this.messages = data;
        this.messages.forEach((ele) => {
          if (this.userId === ele.userId) {
            ele.userName = 'You';
          }
        });
        this._sharedService.closeSnackBar();
        this.isProfileButtonActive = false;
        this.isSendMsgButtonActive = false;
        requestAnimationFrame(() => {
          this.scrollToBottom();
        });
      });
  }

  getChatFusionXUserMessages() {
    this._chatFusionXMsgSubscription = this._chatService
      .getChatFusionXUsersMessage()
      .subscribe((messages: any) => {
        if (messages.userId === this.userId) {
          messages.userName = 'You';
          requestAnimationFrame(() => {
            this.scrollToBottom();
          });
        }
        this.messages.push(messages);
      });
  }

  deleteMessage(chatId: string) {
    this._chatService.deleteChatFusionXChat(chatId, this.userId).subscribe({
      next: (res: any) => {
        this._sharedService.openSnackBar(res.message, 2000);
        this.messages = this.messages.filter((ele) => {
          return ele._id !== chatId;
        });
      },
      error: (error) => {
        this._sharedService.openSnackBar(error.message, 2000);
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
    this._chatFusionXMsgSubscription.unsubscribe();
    this._getSelectedGroupChatSubscription.unsubscribe();
    this._onGroupMessageSubscription.unsubscribe();
    this._isLoadFirstTimeChatCompoSubscription.unsubscribe();
  }
}
