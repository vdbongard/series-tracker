import { Component, OnDestroy, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { SeriesService } from '../../services/series.service';
import { Subscription } from 'rxjs';
import { LastActivity, SeriesWatched } from '../../../types/interfaces/Trakt';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  subscriptions: Subscription[] = [];
  seriesWatched: SeriesWatched[] = [];

  constructor(private oauthService: OAuthService, private seriesService: SeriesService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.oauthService.hasValidAccessToken();

    if (!this.isLoggedIn) return;

    this.seriesService.getLastActivity().subscribe((lastActivity: LastActivity) => {
      const localLastActivity = this.seriesService.getLocalLastActivity();
      if (
        Object.keys(localLastActivity).length > 0 &&
        new Date(lastActivity.episodes.watched_at) <=
          new Date(localLastActivity.episodes.watched_at)
      )
        return;

      this.seriesService.setLocalLastActivity(lastActivity);
      this.seriesService.sync();
    });

    this.subscriptions = [
      this.seriesService.seriesWatched.subscribe((series) => (this.seriesWatched = series)),
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  async login(): Promise<void> {
    this.oauthService.initCodeFlow();
  }
}
