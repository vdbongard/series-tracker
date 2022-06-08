import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  LastActivity,
  SeriesProgress,
  SeriesWatched,
  SeriesWatchedHistory,
} from '../../types/interfaces/Trakt';
import { LocalStorage } from '../../types/enum';
import { getLocalStorage, setLocalStorage } from '../helper/local-storage';

@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  baseUrl = 'https://api.trakt.tv';
  options = {
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'trakt-api-version': '2',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'trakt-api-key': '85ac87a505a1a8f62d1e4284ea630f0632459afcd0a9e5c9244ad4674e90140e',
    },
  };

  seriesWatched = new BehaviorSubject<SeriesWatched[]>(this.getLocalSeriesWatched()?.series || []);

  constructor(private http: HttpClient) {}

  getSeriesWatched(): Observable<SeriesWatched[]> {
    return this.http.get(`${this.baseUrl}/sync/watched/shows`, this.options) as Observable<
      SeriesWatched[]
    >;
  }

  getSeriesWatchedHistory(): Observable<SeriesWatchedHistory[]> {
    return this.http.get(`${this.baseUrl}/sync/history/shows`, this.options) as Observable<
      SeriesWatchedHistory[]
    >;
  }

  getSeriesProgress(id: string): Observable<SeriesProgress[]> {
    return this.http.get(
      `${this.baseUrl}/shows/${id}/progress/watched`,
      this.options
    ) as Observable<SeriesProgress[]>;
  }

  getLastActivity(): Observable<LastActivity> {
    return this.http.get(
      `${this.baseUrl}/sync/last_activities`,
      this.options
    ) as Observable<LastActivity>;
  }

  getLocalLastActivity(): LastActivity {
    return getLocalStorage(LocalStorage.LAST_ACTIVITY) as LastActivity;
  }

  setLocalLastActivity(lastActivity: LastActivity): void {
    setLocalStorage(LocalStorage.LAST_ACTIVITY, lastActivity);
  }

  getLocalSeriesWatched(): { series: SeriesWatched[] } {
    return getLocalStorage(LocalStorage.SERIES_WATCHED) as { series: SeriesWatched[] };
  }

  setLocalSeriesWatched(seriesWatched: { series: SeriesWatched[] }): void {
    setLocalStorage(LocalStorage.SERIES_WATCHED, seriesWatched);
  }

  sync(): void {
    this.getSeriesWatched().subscribe((series) => {
      this.setLocalSeriesWatched({ series });
      this.seriesWatched.next(series);
    });
  }
}
