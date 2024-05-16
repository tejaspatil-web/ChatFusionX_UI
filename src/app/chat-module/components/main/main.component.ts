import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  public isBasePathRoute: boolean = true;
  constructor(private _router: Router) {}

  ngOnInit(): void {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Check if the current route path is the base path ('/')
        this.isBasePathRoute = event.url === '/';
      });
  }

  ngOnDestroy(): void {}
}
