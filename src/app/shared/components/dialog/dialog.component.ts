import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/chat-module/services/chat/chat.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit, OnDestroy {
  private _createdGroupSubscription: Subscription = new Subscription();
  public userFirstName: string = '';
  public userLastName: string = '';
  public groupName: string = '';
  public isLoding: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialogRef: MatDialogRef<DialogComponent>,
    private _chatService: ChatService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    switch (this.data.type) {
      case 'first-load':
        this.userFirstName = '';
        this.userLastName = '';
        break;
      case 'edit-profile':
        this.userFirstName = localStorage.getItem('firstName');
        this.userLastName = localStorage.getItem('lastName');
        break;
      case 'create-group':
        this.getGroupCreatedDetails();
        break;
    }
  }

  getGroupCreatedDetails() {
    this._createdGroupSubscription = this._chatService
      .onGroupCreate()
      .subscribe((data) => {
        this.isLoding = false;
        this._dialogRef.close(true);
      });
  }

  disabled() {
    if (
      (this.userFirstName === '' || this.userLastName === '') &&
      this.groupName === ''
    ) {
      return true;
    } else if (
      this.userFirstName === localStorage.getItem('firstName') &&
      this.userLastName === localStorage.getItem('lastName')
    ) {
      return true;
    }
    return false;
  }

  public saveDetails() {
    switch (this.data.type) {
      case 'first-load':
        if (this.userFirstName !== '' && this.userLastName !== '') {
          this.isLoding = true;
          const userName = `${this.userFirstName} ${this.userLastName}`;
          this._chatService.getUserId(userName).subscribe((userId: string) => {
            localStorage.setItem('userId', userId);
            localStorage.setItem('firstName', this.userFirstName);
            localStorage.setItem('lastName', this.userLastName);
            this.isLoding = false;
            this._dialogRef.close(true);
          });
        }
        break;
      case 'edit-profile':
        this._chatService
          .updateUserName(
            localStorage.getItem('userId'),
            `${this.userFirstName} ${this.userLastName}`
          )
          .subscribe({
            next: (value) => {
              localStorage.setItem('firstName', this.userFirstName);
              localStorage.setItem('lastName', this.userLastName);
              const config = new MatSnackBarConfig();
              config.duration = 2000; // Duration in milliseconds
              config.verticalPosition = 'top';
              config.panelClass = ['center-text'];
              this._snackBar.open('Username updated successfully', '', config);
              this._dialogRef.close(true);
            },
            error: (error) => {
              const config = new MatSnackBarConfig();
              config.duration = 2000; // Duration in milliseconds
              config.verticalPosition = 'top';
              config.panelClass = ['error'];
              this._snackBar.open(
                'Something went wrong. Your username was not updated',
                '',
                config
              );
            },
          });
        break;
      case 'create-group':
        this.isLoding = true;
        const userId = localStorage.getItem('userId');
        this._chatService.createGroup(this.groupName, userId);
        break;
    }
  }

  ngOnDestroy(): void {
    this._createdGroupSubscription.unsubscribe();
  }
}
