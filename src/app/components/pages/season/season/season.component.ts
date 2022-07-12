import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  EpisodeFull,
  Ids,
  SeasonProgress,
  ShowWatched,
} from '../../../../../types/interfaces/Trakt';
import { ShowService } from '../../../../services/show.service';

@Component({
  selector: 'app-season',
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.scss'],
})
export class SeasonComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  seasonProgress?: SeasonProgress;
  showWatched?: ShowWatched;
  episodes: (EpisodeFull | undefined)[] = [];
  slug?: string;
  seasonNumber?: number;
  ids?: Ids;

  constructor(private route: ActivatedRoute, public showService: ShowService) {}

  ngOnInit(): void {
    this.subscriptions = [
      this.route.params.subscribe(async (params) => {
        this.slug = params['slug'];
        if (!this.slug) return;

        this.ids = this.showService.getIdForSlug(this.slug);
        if (!this.ids) return;

        this.seasonNumber = parseInt(params['season']);
        if (!this.seasonNumber) return;

        this.seasonProgress = this.showService.getSeasonProgress(this.ids.trakt, this.seasonNumber);
        this.showWatched = this.showService.getShowWatched(this.ids.trakt);

        if (this.seasonProgress) {
          this.episodes = [];
          await Promise.all(
            this.seasonProgress.episodes.map((episodeProgress) =>
              this.showService.syncShowEpisode(
                this.ids?.trakt,
                this.seasonNumber,
                episodeProgress.number
              )
            )
          );

          this.seasonProgress.episodes.forEach((episodeProgress) => {
            if (!this.ids || this.seasonNumber === undefined) return;
            const episode = this.showService.getEpisode(
              this.ids.trakt,
              this.seasonNumber,
              episodeProgress.number
            );
            this.episodes.push(episode);
          });
        }
      }),
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
