import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ChatService } from '../../services/chat/chat.service';
import { SharedService } from 'src/app/shared/services/shared-service/shared-service.service';

export interface groupDetails {
  groupId: string;
  groupName: string;
  unreadCount: number;
  _id: string;
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit, OnDestroy {
  public openChat: boolean = false;
  private _userId: string = '';
  private _firstName: string = '';
  private _lastName: string = '';
  private _groupDetailsSubscription: Subscription = new Subscription();
  private _routeEventSubscription: Subscription = new Subscription();
  private _createdGroupSubscription: Subscription = new Subscription();
  private _getAllGroupChatSubscription: Subscription = new Subscription();
  private _getGroupMessageSubscription: Subscription = new Subscription();
  public groupName: string = '';
  public groups: groupDetails[] | null = null;
  constructor(
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _chatService: ChatService,
    private _sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this._firstName = localStorage.getItem('firstName');
    this._lastName = localStorage.getItem('lastName');
    this._userId = localStorage.getItem('userId');
    this.setRouteBaseOnPathUrl();
    this.getGroupCreatedDetails();
  }

  setRouteBaseOnPathUrl() {
    this.getGroupsList();
    //get path url after first time load component
    const activePath = this._activateRoute.snapshot.url
      .map((segment) => segment.path)
      .join('/');
    const groupsPath = `/chatfusionx/groups/${this._userId}`;
    this.openChat = groupsPath !== `/chatfusionx/${activePath}`;
    if (!this.openChat) this._chatService.groupList(this._userId);
    this.groupName = localStorage.getItem('groupName');
    //subscribe route path change events
    this._routeEventSubscription = this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const isGroupsRoute = event.url === groupsPath;
        this.openChat = !isGroupsRoute;
        if (isGroupsRoute) this._chatService.groupList(this._userId);
      });
  }

  getGroupsList() {
    this._groupDetailsSubscription = this._chatService
      .onGroupList()
      .subscribe((data) => {
        this.groups = data.groupDetails;
      });
  }

  getGroupCreatedDetails() {
    this._createdGroupSubscription = this._chatService
      .onGroupCreate()
      .subscribe((data) => {
        const createdGroupDetails: groupDetails = {
          groupId: data.groupId,
          groupName: data.groupName,
          unreadCount: 0,
          _id: '',
        };
        this.groups.push(createdGroupDetails);
        this._sharedService.openSnackBar(data.message, 2000);
      });
  }

  openGroupChat(group) {
    this.groupName = group.groupName;
    localStorage.setItem('groupName', group.groupName);
    localStorage.setItem('groupId', group.groupId);
    this._chatService.readAllMessages(this._userId, group.groupId);
    this._router.navigate([`/chatfusionx/groups/${group.groupId}`]);
  }

  back() {
    this._router.navigate([`/chatfusionx/groups/${this._userId}`]);
    localStorage.setItem('groupId', '');
  }

  shareGroupLink() {
    const currentUrl = this._router.url;
    const fullUrl = `${window.location.origin}${currentUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Join Our Group!',
          text: 'Hey there! Check out this group and join us:',
          url: fullUrl,
        })
        .then(() => {
          console.log('Link shared successfully');
        })
        .catch((error) => {
          console.error('Error sharing link:', error);
        });
    } else {
      console.warn('Web Share API not supported');
    }
  }

  ngOnDestroy(): void {
    this._groupDetailsSubscription.unsubscribe();
    this._routeEventSubscription.unsubscribe();
    this._createdGroupSubscription.unsubscribe();
    this._getAllGroupChatSubscription.unsubscribe();
    this._getGroupMessageSubscription.unsubscribe();
  }
}
