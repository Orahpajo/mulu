import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { SongFile } from '../file-explorer/song-file.model';
import {
  closeCurrentSongFile,
  createSongFile,
  deleteSongFile,
  editSongFile,
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
      const newFile = new SongFile('New Song');
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
    on(setSongFiles, (state, { songFiles }) => {
      return { 
        ...state, 
        songFiles };
    }),
    on(editSongFile, (state, { file }) => {
      const songFiles = state.songFiles.map((songFile) => {
        if (songFile.id === file.id) {
          return new SongFile(file.name, file.children, file.id);
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
