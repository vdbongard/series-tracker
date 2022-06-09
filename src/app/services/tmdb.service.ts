import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '../config';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { getLocalStorage, setLocalStorage } from '../helper/local-storage';
import { LocalStorage } from '../../types/enum';
import { Configuration, Show } from '../../types/interfaces/Tmdb';

@Injectable({
  providedIn: 'root',
})
export class TmdbService implements OnDestroy {
  baseUrl = 'https://api.themoviedb.org/3';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  options = { headers: { Authorization: `Bearer ${Config.tmdbToken}` } };

  subscriptions: Subscription[] = [];
  config = new BehaviorSubject<Configuration>(this.getLocalConfiguration() || {});
  shows = new BehaviorSubject<{ [key: number]: Show }>(this.getLocalShows() || {});

  constructor(private http: HttpClient) {
    if (Object.keys(this.getLocalConfiguration()).length === 0) {
      this.syncConfig();
    }

    this.subscriptions = [];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getConfig(): Observable<Configuration> {
    return this.http.get(
      `${this.baseUrl}/configuration`,
      this.options
    ) as Observable<Configuration>;
  }

  syncConfig(): void {
    this.getConfig().subscribe((config: Configuration) => {
      this.setLocalConfiguration(config);
      this.config.next(config);
    });
  }

  getShow(id: number): Observable<Show> {
    return this.http.get(`${this.baseUrl}/tv/${id}`, this.options) as Observable<Show>;
  }

  getLocalConfiguration(): Configuration {
    return getLocalStorage(LocalStorage.TMDB_CONFIG) as Configuration;
  }

  setLocalConfiguration(lastActivity: Configuration): void {
    setLocalStorage(LocalStorage.TMDB_CONFIG, lastActivity);
  }

  getLocalShows(): { [key: number]: Show } {
    return getLocalStorage(LocalStorage.TMDB_SHOWS) as { [key: number]: Show };
  }

  setLocalShows(shows: { [key: number]: Show }): void {
    setLocalStorage(LocalStorage.TMDB_SHOWS, shows);
  }

  syncShow(id: number): void {
    const shows = this.shows.value;

    if (!shows[id]) {
      this.getShow(id).subscribe((show) => {
        shows[id] = show;
        this.setLocalShows(shows);
        this.shows.next(shows);
      });
    }
  }

  getShowLocally(id: number): Show {
    return this.shows.value[id];
  }
}