import { createAction } from '@ngrx/store';
import { SongFile } from '../model/song-file.model';
import { MuluFile } from '../model/mulu-file.model';
import { SongTreeNode } from '../model/song-tree-node';

export const createSongFile = createAction('[Song File] Add Song File');

export const duplicateSongFile = createAction(
  '[Song File] Duplicate Song File',
  (file: SongFile) => ({ file })
)

export const importSongFile = createAction(
  '[Song File] Import Song File',
  (file: MuluFile) => ({ file })
);

export const openSongFile = createAction(
  '[Song File] Open Song File',
  (id: string) => ({ id })
);

export const closeCurrentSongFile = createAction(
  '[Song File] Close Current Song File'
);

export const toggleShowAudioFiles = createAction(
  '[Song File] Toggle Show Audio Files'
);

export const showAudioFiles = createAction(
  '[Song File] Show Audio Files'
);

export const toggleEditNameMode = createAction(
  '[Song File] Toggle Edit Name Mode'
);

export const editSongFile = createAction(
  '[Song File] Edit Song File',
  (file: SongFile) => ({ file })
);

export const loadSongFiles = createAction(
  '[Song File] Load Song Files',
);

export const setSongFiles = createAction(
  '[Song File] Set Songs',
  (songFiles: SongFile[],songTreeNodes: SongTreeNode[], currentSongFile: SongFile | null) => 
    ({ songFiles, songTreeNodes: songTreeNodes, currentSongFile })
);

export const saveSongFiles = createAction(
  '[Song File] Save Song Files',
);

export const deleteSongFileWithQuestion = createAction(
  '[Song File] Delete Song File With Question',
  (file: SongFile) => ({ file })
);

export const deleteSongFile = createAction(
  '[Song File] Delete Song File',
  (file: SongFile) => ({ file })
);

export const setVoiceFilter = createAction(
  '[Song File] Set Voice Filter',
  (voiceFilter: string[]) => ({ voiceFilter })
)