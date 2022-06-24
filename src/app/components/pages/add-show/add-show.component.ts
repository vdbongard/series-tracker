import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin, of, Subscription } from 'rxjs';
import { ShowInfo } from '../../../../types/interfaces/Show';
import { TmdbService } from '../../../services/tmdb.service';
import { ShowService } from '../../../services/show.service';
import { wait } from '../../../helper/wait';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-show',
  templateUrl: './add-show.component.html',
  styleUrls: ['./add-show.component.scss'],
})
export class AddShowComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  shows: ShowInfo[] = [];
  isLoading = new BehaviorSubject<boolean>(false);
  searchValue?: string;

  constructor(
    public showService: ShowService,
    public tmdbService: TmdbService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscriptions = [
      this.route.queryParams.subscribe(async (queryParams) => {
        this.searchValue = queryParams['search'];

        if (!this.searchValue) {
          this.getTrendingShows();
          return;
        }

        this.isLoading.next(true);
        this.shows = [];

        this.showService.getSearchForShows(this.searchValue).subscribe((results) => {
          forkJoin(
            results.map((result) => {
              const tmdbId = result.show.ids.tmdb;
              if (!tmdbId) return of(undefined);
              return this.tmdbService.getShow(tmdbId);
            })
          ).subscribe(async (tmdbShows) => {
            for (let i = 0; i < tmdbShows.length; i++) {
              this.shows.push({
                show: results[i].show,
                tmdbShow: tmdbShows[i],
              });
            }

            await wait();
            this.isLoading.next(false);
          });
        });
      }),
    ];
  }

  getTrendingShows(): void {
    this.isLoading.next(true);
    this.shows = [];
    this.showService.getTrendingShows().subscribe((trendingShows) => {
      if (this.searchValue) return;
      forkJoin(
        trendingShows.map((trendingShow) => this.tmdbService.getShow(trendingShow.show.ids.tmdb))
      ).subscribe(async (tmdbShows) => {
        trendingShows.forEach((trendingShow, i) => {
          this.shows.push({
            show: trendingShows[i].show,
            tmdbShow: tmdbShows[i],
          });
        });
        await wait();
        this.isLoading.next(true);
      });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  async searchSubmitted(): Promise<void> {
    if (!this.searchValue) {
      await this.router.navigate(['add-series']);
      return;
    }

    await this.router.navigate(['add-series'], { queryParams: { search: this.searchValue } });
  }
}