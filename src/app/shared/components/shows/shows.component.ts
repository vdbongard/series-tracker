import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  startWith,
  takeUntil,
  timer,
} from 'rxjs';
import { TmdbConfiguration } from '../../../../types/interfaces/Tmdb';
import { ShowInfo } from '../../../../types/interfaces/Show';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-shows',
  templateUrl: './shows.component.html',
  styleUrls: ['./shows.component.scss'],
})
export class ShowsComponent implements OnChanges {
  @Input() shows: ShowInfo[] = [];
  @Input() isLoading?: Observable<boolean>;
  @Input() tmdbConfig?: TmdbConfiguration | null;
  @Input() withYear?: boolean;
  @Input() withEpisode?: boolean;
  @Input() withAddButtons?: boolean;
  @Input() withLinkToEpisode?: boolean;
  @Input() withEpisodesCount?: boolean;
  @Input() withProgressbar?: boolean;
  @Input() menu?: MatMenu;

  @Output() addFavorite = new EventEmitter();
  @Output() removeFavorite = new EventEmitter();
  @Output() addShow = new EventEmitter();
  @Output() removeShow = new EventEmitter();
  @Output() manageLists = new EventEmitter();

  isLoadingDelayed?: Observable<boolean>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoading']?.currentValue) {
      this.isLoadingDelayed = merge(
        // ON in 1s
        timer(1000).pipe(
          map(() => true),
          takeUntil(changes['isLoading'].currentValue)
        ),
        // OFF once we loading is finished, yet at least in 2s
        combineLatest([this.isLoading, timer(2000)]).pipe(map(() => false))
      ).pipe(startWith(false), distinctUntilChanged());
    }
  }

  showId(index: number, show: ShowInfo): number | undefined {
    return show.show?.ids.trakt;
  }
}
