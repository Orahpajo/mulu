import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { SongFile } from '../file-explorer/song-file.model';
import { closeCurrentSongFile, createSongFile, openSongFile } from './song-file.actions';
import { v4 as uuidv4 } from 'uuid';

interface State {
  songFiles: SongFile[];
  currentSongFile: SongFile | null;
}

const initialState: State = {
  songFiles: [],
  currentSongFile: null,
};

export const songFileFeature = createFeature({
  name: 'songFile',
  reducer: createReducer(
    initialState,
    on(createSongFile, (state) => {
        const newFile = new SongFile('New Song');
        return ({
            ...state,
            songFiles: [...state.songFiles, newFile],
            currentSongFile: newFile,
        });
    }),
    on(openSongFile, (state, { id }) => {
        const currentSongFile = state.songFiles.find((songFile) => songFile.id === id);
        return ({
            ...state,
            currentSongFile: currentSongFile ? currentSongFile : null,
        });
    }),
    on(closeCurrentSongFile, (state) => {
        return ({
            ...state,
            currentSongFile: null,
        });
    }),
  ),
  extraSelectors: ({ selectSongFiles }) => {
    const selectLatestSongFile = createSelector(
      selectSongFiles,
      (songFiles: SongFile[]) => songFiles[songFiles.length - 1]
    );
    const selectSongFile = (props: {id: string}) =>
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
  selectSongFile,
  selectLatestSongFile,
} = songFileFeature;
