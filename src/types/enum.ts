export enum LocalStorage {
  LAST_ACTIVITY = 'lastActivity',
  SHOWS_WATCHED = 'showsWatched',
  SHOWS_PROGRESS = 'showsProgress',
  SHOWS_HIDDEN = 'showHidden',
  SHOWS_EPISODES = 'showsEpisodes',
  TMDB_CONFIG = 'tmdbConfig',
  TMDB_SHOWS = 'tmdbShows',
  FAVORITES = 'favorites',
  CONFIG = 'config',
  ADDED_SHOW_INFO = 'addedShowInfo',
}

export enum Theme {
  LIGHT = 'light-theme',
  DARK = 'dark-theme',
  SYSTEM = 'system-theme',
}

export enum Filter {
  NO_NEW_EPISODES = 'No new episodes',
  COMPLETED = 'Completed',
  HIDDEN = 'Hidden',
}

export enum Sort {
  NEWEST_EPISODE = 'Newest episode',
  LAST_WATCHED = 'Last watched',
}

export enum SortOptions {
  FAVORITES_FIRST = 'Favorites first',
}
