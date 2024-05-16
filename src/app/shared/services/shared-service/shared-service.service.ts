import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  public userDetails: Subject<object> = new Subject<object>();
  constructor() {}

  setUserDetails(userDetails: object) {
    this.userDetails.next(userDetails);
  }

  getUserDetails() {
    return this.userDetails.asObservable();
  }
}
