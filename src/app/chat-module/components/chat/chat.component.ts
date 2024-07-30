import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared/services/shared-service/shared-service.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Shared } from 'src/app/shared/models/shared.model';
import { marked } from 'marked';

interface aiResponseHistroy {
  role: 'user' | 'model';
  parts: aiResponse[];
}

interface aiResponse {
  text: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;
  @ViewChild('scrollAiContainer') private scrollAiContainer: ElementRef;
  @ViewChild('sendMessageInput') private sendMessageInput: ElementRef;
  @ViewChild('sendMessageAiInput') private sendMessageAiInput: ElementRef;
  @Input() isGroupsCompo: boolean = false;
  @Input() groupName: string = '';
  private _getSelectedGroupChatSubscription: Subscription = new Subscription();
  public userMessage: string = '';
  public messages = [];
  public aiResponseData = [];
  private _aiResponseHistroy: aiResponseHistroy[] = [];
  public firstName: string = '';
  public lastName: string = '';
  public userId: string = '';
  private groupId: string = '';
  public isProfileButtonActive: boolean = true;
  public isSendMsgButtonActive: boolean = true;
  public isAiResponse: boolean = false;
  public isAdminUser: boolean = false;
  private selectedStepper: string = 'FusionX Group';
  private _chatFusionXMsgSubscription: Subscription = new Subscription();
  private _onGroupMessageSubscription: Subscription = new Subscription();
  private _isLoadFirstTimeChatCompoSubscription: Subscription =
    new Subscription();
  constructor(
    private _activateRoute: ActivatedRoute,
    private _chatService: ChatService,
    private _sharedService: SharedService
  ) {}

  ngOnInit() {
    this.firstName = localStorage.getItem('firstName');
    this.lastName = localStorage.getItem('lastName');
    this.userId = localStorage.getItem('userId');
    this.getSelectedRoutePath();
    this.getUpdatedUserDetails();
    this.getSelectedGroupChat();
    this.getGroupMessages();
    this.getIsLoadFirstTimeChatCompo();

    this._aiResponseHistroy.push({
      role: 'user',
      parts: [],
    });
    this._aiResponseHistroy.push({
      role: 'model',
      parts: [],
    });
  }

  ngAfterViewInit(): void {
    this.sendMessageInput.nativeElement.addEventListener('keyup', (event) => {
      this.inputKeyupEvent(event);
    });

    if (!this.isGroupsCompo) {
      this.sendMessageAiInput.nativeElement.addEventListener(
        'keyup',
        (event) => {
          this.inputKeyupEvent(event);
        }
      );
    }
  }

  convertMarkdown(content: string) {
    return marked(content);
  }

  inputKeyupEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (this.selectedStepper === 'FusionX Group') {
        this.sendMessageInGroup();
      } else {
        this.sendPrompt();
      }
    }
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
          if (this.groupId === groupMessage.groupId) {
            this.messages.push(groupMessage);
          }
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

  sendMessageInGroup() {
    if (this.userMessage !== '') {
      const currentTime = new Shared().getCurrentTime();
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
      this.sendMessageInput.nativeElement.focus();
    }
  }

  getChatFusionXChatHistory() {
    this._sharedService.openSnackBar('Waiting for connection...', 0);
    this.firstName = localStorage.getItem('firstName');
    this.lastName = localStorage.getItem('lastName');
    this.userId = localStorage.getItem('userId');
    if (this.userId) {
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

  sendPrompt() {
    if (this.userMessage) {
      this.isAiResponse = true;
      const id = this.aiResponseData.length + 1;
      const currentTime = new Shared().getCurrentTime();
      this.aiResponseData.push({
        userName: 'You',
        userMessage: this.userMessage,
        time: currentTime,
        _id: null,
      });

      this.aiResponseData.push({
        userName: 'Ai',
        userMessage: null,
        time: null,
        _id: id,
      });

      const history =
        this._aiResponseHistroy[0].parts.length > 0
          ? this._aiResponseHistroy
          : '';

      this._chatService.getAiResponse(this.userMessage, history).subscribe({
        next: (response: any) => {
          this.aiResponseData.forEach((ele) => {
            if (ele._id === id) {
              ele.userMessage = response;
              ele.time = currentTime;
            }
            this.isAiResponse = false;
          });

          this._aiResponseHistroy
            .find((ele) => ele.role == 'user')
            .parts.push({
              text: this.aiResponseData[this.aiResponseData.length - 2]
                .userMessage,
            });

          this._aiResponseHistroy
            .find((ele) => ele.role == 'model')
            .parts.push({
              text: response,
            });
          requestAnimationFrame(() => {
            this.scrollToBottomAiChat();
            this.sendMessageAiInput.nativeElement.focus();
          });
        },
        error: (error) => {
          this.isAiResponse = false;
        },
      });
      requestAnimationFrame(() => {
        this.scrollToBottomAiChat();
      });
      this.userMessage = '';
    }
  }

  stepperSelectionChanged(event) {
    event.previouslySelectedStep.interacted = false;
    this.selectedStepper = event.selectedStep.label;
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTo({
        top: this.scrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    } catch (err) {
      console.error(err);
    }
  }

  scrollToBottomAiChat(): void {
    try {
      this.scrollAiContainer.nativeElement.scrollTo({
        top: this.scrollAiContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy(): void {
    this.isGroupsCompo = false;
    this._chatFusionXMsgSubscription.unsubscribe();
    this._getSelectedGroupChatSubscription.unsubscribe();
    this._onGroupMessageSubscription.unsubscribe();
    this._isLoadFirstTimeChatCompoSubscription.unsubscribe();
  }
}
