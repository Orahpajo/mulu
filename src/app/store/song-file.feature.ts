import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { SongFile } from '../model/song-file.model';
import {
  closeCurrentSongFile,
  createSongFile,
  deleteSongFile,
  editSongFile,
  importSongFile,
  openSongFile,
  setSongFiles,
  toggleEditNameMode,
} from './song-file.actions';
import { v4 as uuidv4 } from 'uuid';

interface State {
  songFiles: SongFile[];
  currentSongFile: SongFile | null;
  editNameMode: boolean;
}

const initialState: State = {
  songFiles: [],
  currentSongFile: null,
  editNameMode: false,
};

export const songFileFeature = createFeature({
  name: 'songFile',
  reducer: createReducer(
    initialState,
    on(createSongFile, (state) => {
      let songName = generateSongName(state);
      const newFile = SongFile.create(songName);
      return {
        ...state,
        songFiles: [...state.songFiles, newFile],
        currentSongFile: newFile,
      };
    }),
    on(importSongFile, (state, { file }) => {
      const newFile = SongFile.create(file.songFile.name, file.songFile.children, file.songFile.audiofiles, uuidv4(), file.songFile.text, file.songFile.cues);
      return {
        ...state,
        songFiles: [...state.songFiles, newFile],
        currentSongFile: newFile,
      };
    }),
    on(openSongFile, (state, { id }) => {
      const currentSongFile = state.songFiles.find(
        (songFile) => songFile.id === id
      );
      return {
        ...state,
        currentSongFile: currentSongFile ? currentSongFile : null,
      };
    }),
    on(closeCurrentSongFile, (state) => {
      return {
        ...state,
        currentSongFile: null,
      };
    }),
    on(toggleEditNameMode, (state) => {
      return {
        ...state,
        editNameMode: !state.editNameMode,
      };
    }),
    on(setSongFiles, (state, { songFiles, currentSongFile }) => {
      return { 
        ...state, 
        songFiles,
        currentSongFile 
      };
    }),
    on(editSongFile, (state, { file }) => {
      const songFiles = state.songFiles.map((songFile) => {
        if (songFile.id === file.id) {
          return file;
        }
        return songFile;
      });
      const currentSongFile = songFiles.find(
        (songFile) => songFile.id === state.currentSongFile?.id
      );
      return {
        ...state,
        currentSongFile: currentSongFile ? currentSongFile : null,
        songFiles
      };
    }), 
    on(deleteSongFile, (state, { file }) => {
      const songFiles = state.songFiles.filter(
        (songFile) => songFile.id !== file.id
      );
      return {
        ...state,
        songFiles,
      };
    }),
  ),
  extraSelectors: ({ selectSongFiles }) => {
    const selectLatestSongFile = createSelector(
      selectSongFiles,
      (songFiles: SongFile[]) => songFiles[songFiles.length - 1]
    );
    const selectSongFile = (props: { id: string }) =>
      createSelector(selectSongFiles, (songFiles: SongFile[]) =>
        songFiles.find((songFile) => songFile.id === props.id)
      );
    return { selectLatestSongFile, selectSongFile };
  },
});

export const {
  reducer,
  selectSongFileState,
  selectSongFiles,
  selectCurrentSongFile,
  selectEditNameMode,
  selectSongFile,
  selectLatestSongFile,
} = songFileFeature;
function generateSongName(state: State) {
  let songName = 'New Song';
  while (state.songFiles.find(song => song.name === songName)) {
    const match = songName.match(/\((\d+)\)$/);
    if (match) {
      const number = parseInt(match[1], 10);
      songName = songName.replace(/\(\d+\)$/, `(${number + 1})`);
    } else {
      songName = songName + ' (2)';
    }
  }
  return songName;
}

