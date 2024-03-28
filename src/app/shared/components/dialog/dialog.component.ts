import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatService } from 'src/app/chat-module/services/chat/chat.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  public userFirstName: string = '';
  public userLastName: string = '';
  public isLoding: boolean = false;
  constructor(
    private _dialogRef: MatDialogRef<DialogComponent>,
    private _chatService: ChatService
  ) {}

  public saveUserDetails() {
    if (this.userFirstName !== '' && this.userLastName !== '') {
      this.isLoding = true;
      const userName = `${this.userFirstName} ${this.userLastName}`;
      this._chatService.getUserId(userName).subscribe((userId: string) => {
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        this.isLoding = false;
        this._dialogRef.close();
      });
    }
  }
}
