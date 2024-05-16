import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit {
  public openChat: boolean = false;
  private _userId: string = '';
  constructor(
    private _router: Router,
    private _activateRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._userId = localStorage.getItem('userId');
    this.setRouteBaseOnPathUrl();
  }

  setRouteBaseOnPathUrl() {
    const validPath = `/chatfusionx/groups/${this._userId}`;

    //get path url after first time load component
    const activePath = this._activateRoute.snapshot.url
      .map((segment) => segment.path)
      .join('/');
    this.openChat = validPath !== `/chatfusionx/${activePath}`;

    //subscribe route path change events
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const isGroupsRoute = event.url === validPath;
        this.openChat = !isGroupsRoute;
      });
  }

  openGroupChat() {
    this._router.navigate([`/chatfusionx/groups/${123325454}`]);
  }

  back() {
    this._router.navigate([`/chatfusionx/groups/${this._userId}`]);
  }

  shareGroupLink() {
    if (navigator.share) {
      navigator
        .share({
          title: 'Join Our Group!',
          text: 'Hey there! Check out this group and join us:',
          url: '',
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
}
