import { Component, Input } from '@angular/core';
import { Episode, EpisodeProgress } from '../../../../../types/interfaces/Trakt';

@Component({
  selector: 'app-episode-item',
  templateUrl: './episode-item.component.html',
  styleUrls: ['./episode-item.component.scss'],
})
export class EpisodeItemComponent {
  @Input() episodeProgress?: EpisodeProgress;
  @Input() episode?: Episode | undefined;
}
