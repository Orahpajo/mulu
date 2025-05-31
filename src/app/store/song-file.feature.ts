import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { SongFile } from '../model/song-file.model';
import {
  closeCurrentSongFile,
  createSongFile,
  deleteSongFile,
  duplicateSongFile,
  editSongFile,
  importSongFile,
  openSongFile,
  setSongFiles,
  showAudioFiles,
  toggleEditNameMode,
  toggleShowAudioFiles,
} from './song-file.actions';
import { v4 as uuidv4 } from 'uuid';
import { SongTreeNode } from '../model/song-tree-node';


interface State {
  songFiles: SongFile[];
  currentSongFile: SongFile | null;
  editNameMode: boolean;
  showAudioFiles: boolean;
  songTreeNodes: SongTreeNode[];
}

const initialState: State = {
  songFiles: [],
  currentSongFile: null,
  editNameMode: false,
  showAudioFiles: false,
  songTreeNodes: [],
};

export const songFileFeature = createFeature({
  name: 'songFile',
  reducer: createReducer(
    initialState,
    on(createSongFile, (state) => {
      const songName = guardDuplicateSongName('New Song',state);
      const newFile = SongFile.create(songName);
      return {
        ...state,
        songFiles: [...state.songFiles, newFile],
        songTreeNodes: [...state.songTreeNodes, {songId: newFile.id}],
        currentSongFile: newFile,
      };
    }),
    on(duplicateSongFile, (state, { file }) => {
      const songName = guardDuplicateSongName(file.name, state);
      const duplicate = SongFile.create(
        songName,
        file.audiofiles,
        uuidv4(),
        file.text,
        file.cues,
        false,
        file.selectedAudioFile?.id
      );
      return {
        ...state,
        songFiles: [...state.songFiles, duplicate],
        songTreeNodes: [...state.songTreeNodes, {songId: duplicate.id}],
      }
    }),
    on(importSongFile, (state, { file }) => {
      const songName = guardDuplicateSongName(file.songFile.name,state);
      const newFile = SongFile.create(songName, file.songFile.audiofiles, uuidv4(), file.songFile.text, file.songFile.cues);
      
      // put importet songfile in download folder
      let downloadFolder = state.songTreeNodes.find(stn => stn.isDownloadFolder)!;
      if (!downloadFolder || !downloadFolder.children){
        downloadFolder = {
          name: 'Heruntergeladen',
          children: [],
          isDownloadFolder: true,
          expanded: true,
        }
      }
      // -- copy download folder before editing
      downloadFolder = {...downloadFolder, children: [... downloadFolder.children]}
      downloadFolder.children.push(
        {songId: file.songFile.id}
      )

      return {
        ...state,
        songTreeNodes: [
          downloadFolder,
          ...state.songTreeNodes.filter(stn => !stn.isDownloadFolder)
        ],        
        songFiles: [...state.songFiles, newFile],
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
    on(setSongFiles, (state, { songFiles, songTreeNodes, currentSongFile }) => {
      return { 
        ...state, 
        songFiles,
        songTreeNodes: songTreeNodes,
        currentSongFile 
      };
    }),
    on(editSongFile, (state, { file }) => {
      // insert file into list of songFiles
      // if file already exists, replace it
      const songFiles = state.songFiles.map((songFile) => {
        if (songFile.id === file.id) {
          return file;
        }
        return songFile;
      });
      // update current song File. It could have been changed
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
      const songTreeNodes = [...state.songTreeNodes.filter(treeNode => treeNode.songId !== file.id)]
      return {
        ...state,
        songFiles,
        songTreeNodes: songTreeNodes,
      };
    }),
    on(toggleShowAudioFiles, (state) => {
      return {
        ...state,
        showAudioFiles: !state.showAudioFiles,
      };
    }),
    on(showAudioFiles, (state) => {
      return {
        ...state,
        showAudioFiles: true
      }
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
  selectSongTreeNodes,
  selectLatestSongFile,
  selectShowAudioFiles,
} = songFileFeature;

function guardDuplicateSongName(songName: string, state: State) {
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

