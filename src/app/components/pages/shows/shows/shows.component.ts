import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  EpisodeFull,
  ShowHidden,
  ShowProgress,
  ShowWatched,
} from '../../../../../types/interfaces/Trakt';
import { Configuration } from '../../../../../types/interfaces/Configuration';
import { Show } from '../../../../../types/interfaces/Tmdb';
import { combineLatest, Subject, Subscription, tap } from 'rxjs';
import { ShowService } from '../../../../services/show.service';
import { TmdbService } from '../../../../services/tmdb.service';
import { ConfigService } from '../../../../services/config.service';
import { wait } from '../../../../helper/wait';

@Component({
  selector: 'app-shows-page',
  templateUrl: './shows.component.html',
  styleUrls: ['./shows.component.scss'],
})
export class ShowsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  shows: {
    showWatched: ShowWatched;
    showProgress: ShowProgress;
    tmdbShow: Show;
    favorite: boolean;
  }[] = [];
  isLoading = new Subject<boolean>();

  constructor(
    public showService: ShowService,
    public tmdbService: TmdbService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.subscriptions = [
      combineLatest([
        this.showService.showsWatched,
        this.showService.showsProgress,
        this.showService.showsHidden,
        this.showService.showsEpisodes,
        this.showService.favorites,
        this.configService.config,
        this.tmdbService.shows,
      ])
        .pipe(tap(() => this.isLoading.next(true)))
        .subscribe({
          next: async ([
            showsWatched,
            showsProgress,
            showsHidden,
            showsEpisodes,
            favorites,
            config,
            tmdbShows,
          ]) => {
            const shows: {
              showWatched: ShowWatched;
              showProgress: ShowProgress;
              tmdbShow: Show;
              favorite: boolean;
            }[] = [];

            if (
              !showsWatched ||
              !showsHidden ||
              !config ||
              !showsProgress ||
              !showsEpisodes ||
              !tmdbShows
            )
              return;

            for (const showWatched of showsWatched) {
              if (!tmdbShows[showWatched.show.ids.tmdb]) return;
              const showProgress = showsProgress[showWatched.show.ids.trakt];
              if (!showProgress) return;
              if (
                showProgress.next_episode &&
                !showsEpisodes[
                  `${showWatched.show.ids.trakt}-${showProgress.next_episode.season}-${showProgress.next_episode.number}`
                ]
              )
                return;
            }

            showsWatched.forEach((showWatched) => {
              const showProgress = showsProgress[showWatched.show.ids.trakt];
              if (!showProgress) return;
              if (this.hideNoNewEpisodes(showProgress, config)) return;
              if (this.hideCompleted(showProgress, tmdbShows[showWatched.show.ids.tmdb], config))
                return;
              if (this.hideHidden(showsHidden, showWatched, config)) return;

              const tmdbShow = tmdbShows[showWatched.show.ids.tmdb];
              const favorite = favorites.includes(showWatched.show.ids.trakt);

              shows.push({ showWatched, showProgress, tmdbShow, favorite });
            });
            shows.sort((a, b) => {
              const sortFavorites = this.sortFavoritesFirst(a, b, favorites, config);
              if (sortFavorites) return sortFavorites;

              const sortByNextEpisode = this.sortByNewestEpisode(
                a,
                b,
                showsEpisodes as { [id: string]: EpisodeFull },
                config
              );
              if (sortByNextEpisode) return sortByNextEpisode;

              return 1;
            });

            await wait();
            this.isLoading.next(false);
            this.shows = shows;
          },
          error: () => this.isLoading.next(false),
        }),
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private hideHidden(
    showsHidden: ShowHidden[],
    showWatched: ShowWatched,
    config: Configuration
  ): boolean {
    return (
      !!config.filters.find((filter) => filter.name === 'Hidden' && filter.value) &&
      !!showsHidden.find((show) => show.show.ids.trakt === showWatched.show.ids.trakt)
    );
  }

  private hideNoNewEpisodes(showProgress: ShowProgress, config: Configuration): boolean {
    return (
      !!config.filters.find((filter) => filter.name === 'No new episodes' && filter.value) &&
      showProgress.aired === showProgress.completed
    );
  }

  private hideCompleted(
    showProgress: ShowProgress,
    tmdbShow: Show,
    config: Configuration
  ): boolean {
    return (
      !!config.filters.find((filter) => filter.name === 'Completed' && filter.value) &&
      ['Ended', 'Canceled'].includes(tmdbShow.status) &&
      showProgress.aired === showProgress.completed
    );
  }

  private sortFavoritesFirst(
    a: { showWatched: ShowWatched; showProgress: ShowProgress },
    b: { showWatched: ShowWatched; showProgress: ShowProgress },
    favorites: number[],
    config: Configuration
  ): number | undefined {
    if (
      !config.sortOptions.find(
        (sortOption) => sortOption.name === 'Favorites first' && sortOption.value
      )
    )
      return;
    if (
      favorites.includes(a.showWatched.show.ids.trakt) &&
      !favorites.includes(b.showWatched.show.ids.trakt)
    )
      return -1;
    if (
      favorites.includes(b.showWatched.show.ids.trakt) &&
      !favorites.includes(a.showWatched.show.ids.trakt)
    )
      return 1;
    return;
  }

  private sortByNewestEpisode(
    a: { showWatched: ShowWatched; showProgress: ShowProgress },
    b: { showWatched: ShowWatched; showProgress: ShowProgress },
    showsEpisodes: { [id: string]: EpisodeFull },
    config: Configuration
  ): number | undefined {
    if (config.sort.by !== 'Newest episode') return;

    const nextEpisodeA =
      a.showProgress.next_episode &&
      showsEpisodes[
        `${a.showWatched.show.ids.trakt}-${a.showProgress.next_episode.season}-${a.showProgress.next_episode.number}`
      ];
    const nextEpisodeB =
      b.showProgress.next_episode &&
      showsEpisodes[
        `${b.showWatched.show.ids.trakt}-${b.showProgress.next_episode.season}-${b.showProgress.next_episode.number}`
      ];
    if (!nextEpisodeA) return 1;
    if (!nextEpisodeB) return -1;
    return (
      new Date(nextEpisodeB.first_aired).getTime() - new Date(nextEpisodeA.first_aired).getTime()
    );
  }
}
