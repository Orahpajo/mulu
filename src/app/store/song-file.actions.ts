import { createAction } from '@ngrx/store';
import { SongFile } from '../file-explorer/song-file.model';

export const createSongFile = createAction('[Song File] Add Song File');

export const openSongFile = createAction(
  '[Song File] Open Song File',
  (id: string) => ({ id })
);

export const closeCurrentSongFile = createAction(
  '[Song File] Close Current Song File'
);

export const toggleEditNameMode = createAction(
  '[Song File] Toggle Edit Name Mode'
);

export const editSongFile = createAction(
  '[Song File] Edit Song File',
  (file: SongFile) => ({ file })
);