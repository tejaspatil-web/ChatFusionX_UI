import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  public userDetails: Subject<object> = new Subject<object>();
  public isLoadFirstTimeChatCompo: Subject<boolean> = new Subject<boolean>();
  public uneadMessageCount: Subject<any> = new Subject<any>();
  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar(message: string, time: number) {
    const config = new MatSnackBarConfig();
    config.duration = time; // Duration in milliseconds
    config.verticalPosition = 'top';
    config.panelClass = ['center-text'];
    this._snackBar.open(message, '', config);
  }

  closeSnackBar() {
    this._snackBar.dismiss();
  }

  setIsLoadFirstTimeChatCompo(isFirstTimeLoad: boolean) {
    this.isLoadFirstTimeChatCompo.next(isFirstTimeLoad);
  }

  getIsLoadFirstTimeChatCompo() {
    return this.isLoadFirstTimeChatCompo.asObservable();
  }

  setUserDetails(userDetails: object) {
    this.userDetails.next(userDetails);
  }

  getUserDetails() {
    return this.userDetails.asObservable();
  }

  setUnreadMessageCount(data) {
    this.uneadMessageCount.next(data);
  }

  getUnreadMessageCount() {
    return this.uneadMessageCount.asObservable();
  }
}
