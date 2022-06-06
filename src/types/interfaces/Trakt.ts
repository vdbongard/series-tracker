/* eslint-disable @typescript-eslint/naming-convention */

export interface SeriesWatched {
  last_updated_at: string;
  last_watched_at: string;
  plays: number;
  reset_at: string;
  seasons: SeasonWatched[];
  show: Series;
}

export interface SeasonWatched {
  episodes: EpisodeWatched[];
  number: number;
}

export interface EpisodeWatched {
  last_watched_at: string;
  number: number;
  plays: number;
}

export interface Series {
  ids: Ids;
  title: string;
  year: number;
}

export interface Ids {
  imdb: string;
  slug: string;
  tmdb: number;
  trakt: number;
  tvdb: number;
  tvrage: number;
}

export interface SeriesProgress {
  aired: number;
  completed: number;
  last_episode: Episode;
  last_watched_at: string;
  next_episode: Episode;
  reset_at: string | null;
  seasons: Season[];
}

export interface Episode {
  ids: Ids;
  number: number;
  season: number;
  title: string;
}

export interface Season {
  aired: number;
  completed: number;
  episodes: EpisodeProgress[];
  number: number;
  title: string;
}

export interface EpisodeProgress {
  completed: boolean;
  last_watched_at: string;
  number: number;
}
