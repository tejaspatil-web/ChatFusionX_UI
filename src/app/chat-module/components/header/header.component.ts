import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { SharedService } from 'src/app/shared/services/shared-service/shared-service.service';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public isProfileButtonActive: boolean = false;
  public firstName: string = '';
  public lastName: string = '';
  public userId: string = '';
  public isNotBasePathRoute: boolean = false;
  public groupCount: number = 0;

  constructor(
    public dialog: MatDialog,
    private _sharedService: SharedService,
    private _chatService: ChatService,
    private _router: Router
  ) {}
  ngOnInit(): void {
    this.getGroupCount();
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Check if the current route path is the base path ('/')
        this.isNotBasePathRoute = event.url !== '/';
        if (!this.isNotBasePathRoute && this.userId)
          this._chatService.groupCount(this.userId);
      });
    this.firstName = localStorage.getItem('firstName');
    this.lastName = localStorage.getItem('lastName');
    this.userId = localStorage.getItem('userId');
    if (!this.userId) {
      this.getUserDetails();
    }
  }

  getGroupCount() {
    this._chatService.getGroupCount().subscribe((count) => {
      this.groupCount = count.groupsCount;
    });
  }

  getUserDetails() {
    this._sharedService.getUserDetails().subscribe((userData: any) => {
      this.firstName = userData.firstName;
      this.lastName = userData.lastName;
      this.userId = userData.userId;
    });
  }

  editProfile() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { type: 'edit-profile' },
      width: '300px',
      height: '275px',
    });
    dialogRef.afterClosed().subscribe((status) => {
      if (status) {
        this._sharedService.getUserDetails().subscribe().unsubscribe();
        this.firstName = localStorage.getItem('firstName');
        this.lastName = localStorage.getItem('lastName');
        this.userId = localStorage.getItem('userId');
        this._sharedService.setUserDetails({
          firstName: this.firstName,
          lastName: this.lastName,
          userId: this.userId,
        });
      }
    });
  }

  createNewGroup() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { type: 'create-group' },
      width: '300px',
      height: '200px',
    });
    //This code use may be use in future
    // dialogRef.afterClosed().subscribe((status) => {
    //   if (status) {}
    // });
  }

  openGroupsTab() {
    this._router.navigate([`/chatfusionx/groups/${this.userId}`]);
  }

  back() {
    this._router.navigate(['/']);
  }
}
