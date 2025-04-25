import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { SongFile } from '../file-explorer/song-file.model';
import { createSongFile } from './song-file.actions';
import { v4 as uuidv4 } from 'uuid';

interface State {
  songFiles: SongFile[];
}

const initialState: State = {
  songFiles: [],
};

export const songFileFeature = createFeature({
  name: 'songFile',
  reducer: createReducer(
    initialState,
    on(createSongFile, (state) => ({
      ...state,
      songFiles: [...state.songFiles, new SongFile('New Song')],
    }))
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
  selectSongFile,
  selectLatestSongFile,
} = songFileFeature;
