import { createAction } from '@ngrx/store';

export const createSongFile = createAction(
  '[Song File] Add Song File',
);

export const openSongFile = createAction(
  '[Song File] Open Song File',
  (id: string) => ({ id })
);

export const closeCurrentSongFile = createAction(
  '[Song File] Close Current Song File'
);