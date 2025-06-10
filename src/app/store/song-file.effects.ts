import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, withLatestFrom, switchMap, tap } from 'rxjs/operators';
import { closeCurrentSongFile, createSongFile, deleteSongFile, deleteSongFileWithQuestion, duplicateSongFile, editSongFile, importSongFile, loadSongFiles, openSongFile, saveSongFiles, setSongFiles } from './song-file.actions';
import { SongFile } from '../model/song-file.model';
import { selectCurrentSongFile, selectSongFiles, selectSongTreeNodes } from './song-file.feature';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { DialogData, YesNoDialogComponent } from '../yes-no-dialog/yes-no-dialog.component';
import { Router } from '@angular/router';
import localforage from 'localforage';
import { firstValueFrom, from } from 'rxjs';
import { SongTreeNode } from '../model/song-tree-node';
import { CommonSongService } from '../services/common-song.service';


@Injectable()
export class SongFileEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private dialog = inject(MatDialog); 
    private router = inject(Router);
    private commonSongService = inject(CommonSongService);

    loadSongFiles$ = createEffect(() => 
        this.actions$.pipe(
            ofType(loadSongFiles),
            switchMap(async () => {
                const containsSongFile = (treeNodes: SongTreeNode[], songFile: SongFile) => {
                    if (!treeNodes || treeNodes.length <= 0){
                        return false;
                    }
                    return treeNodes.some(treeNode => !!treeNode && treeNode.songId === songFile.id) 
                        || containsSongFile(
                            treeNodes
                                .filter(treeNode => treeNode.children && treeNode.children.length > 0)
                                .flatMap(treeNode => treeNode.children), 
                            songFile
                        );
                }

                // Load the songfiles
                const rawFiles = await localforage.getItem<string>('songFiles');
                let songFiles: SongFile[] = [];
                if (rawFiles) {
                    const arr = JSON.parse(rawFiles);
                    songFiles = arr.map((obj: any) =>
                    new SongFile(obj.name, obj.id, obj.audiofiles, obj.text, obj.cues, obj.isCommonSong, obj.selectedAudioFileId));
                }      
                
                // Load the current File ID
                const currentSongFileId = await localforage.getItem<string>('currentSongFileId');
                const currentSongFile = songFiles.find((file) => file.id === currentSongFileId) || null;

                // Download common Songs
                const loadedSongFiles = await firstValueFrom(this.commonSongService.loadCommonSongs());
                loadedSongFiles.forEach(loadedFile => {
                    const localFile = songFiles.find(sf => sf.id === loadedFile.id);
                    if(!localFile){
                        // if the file was never downloaded put it in the list
                        songFiles.push(loadedFile);
                    } else if (!localFile.lastEdit || loadedFile.lastEdit > localFile.lastEdit) {
                        // if the file was updated, replace it in the list
                        const index = songFiles.indexOf(localFile);
                        songFiles[index] = loadedFile;
                    }
                });

                // Load Song treeNodes
                const rawtreeNodes = await localforage.getItem<string>('songtreeNodes');
                let treeNodes: SongTreeNode[] = [];
                if (rawtreeNodes){
                    const arr = JSON.parse(rawtreeNodes);
                    treeNodes = arr.map((o: SongTreeNode) => ({
                        name: o.name,
                        songId: o.songId,
                        children: o.children,
                        isDownloadFolder: o.isDownloadFolder
                        } satisfies SongTreeNode))
                }

                // Put downloaded songs in the download folder
                let downloadFolder = treeNodes.find(f => f.isDownloadFolder);
                if (!downloadFolder || !downloadFolder.children) {
                    downloadFolder = { name: 'Heruntergeladen', children: [], isDownloadFolder: true, expanded: true };
                    treeNodes.unshift(downloadFolder);
                }
                loadedSongFiles
                    .filter(cs => !downloadFolder!.children.map(child => child.songId).includes(cs.id))
                    .forEach(cs => downloadFolder!.children.push({songId: cs.id}));

                // create Tree Nodes for songs that dont have one
                songFiles.forEach(songFile => {
                    if(songFile.id && !containsSongFile(treeNodes, songFile)){
                        treeNodes.push({songId: songFile.id} satisfies SongTreeNode)
                    }
                });

                return setSongFiles(songFiles, treeNodes, currentSongFile);
            })
        )
    );

    saveSongFiles$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(saveSongFiles),
                withLatestFrom(this.store.select(selectSongFiles), this.store.select(selectSongTreeNodes)),
                switchMap(async ([_, songFiles, songTreeNodes]) => {
                    await localforage.setItem('songFiles', JSON.stringify(songFiles));
                    await localforage.setItem('songTreeNodes', JSON.stringify(songTreeNodes));

                })
            ),
        { dispatch: false }
    );

    /**
     * Open a dialog when a song file is deleted. If the user confirms, delete the song file.
     */
    deleteSongFileWithQuestion$ = createEffect(
        () =>   
            this.actions$.pipe(
                ofType(deleteSongFileWithQuestion),
                switchMap(({ file }) => {
                    const dialogRef = this.dialog.open<YesNoDialogComponent, DialogData, boolean>(YesNoDialogComponent, {
                        width: '300px',
                        data: {
                            question: 'Song wirklich löschen?',
                        }
                        });
                    return dialogRef.afterClosed().pipe(
                        map((result) => { 
                            if (result === true) {
                                this.router.navigate(['/']);
                                return deleteSongFile(file);
                            } else {
                                return { type: 'NO_ACTION' }; 
                            }
                        })
                    );
                })
            )
    );

    saveSongsAfterChange$ = createEffect(() =>
        this.actions$.pipe(
            ofType(editSongFile, createSongFile, deleteSongFile, duplicateSongFile),
            map(() => saveSongFiles())
        )
    );

    closeSongFileAfterDelete$ = createEffect(() => 
        this.actions$.pipe(
            ofType(deleteSongFile),
            map((file) => {
                for (let audioFile of file.file.audiofiles){
                    this.commonSongService.deleteAudioBytes(audioFile.id);
                }
                return closeCurrentSongFile()
            })
        )
    );

    openDuplicateFile$ = createEffect(() => 
        this.actions$.pipe(
            ofType(duplicateSongFile),
            tap(() => this.router.navigate(['/song']))
        ),
        {dispatch: false}
    );

    /** 
     * When the current song file is opened or closed, save the current song file ID to localforage
     * so that the page can be reloaded with the same song file
     */
    changeCurrentSongFileId$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(openSongFile, closeCurrentSongFile),
                withLatestFrom(this.store.select(selectCurrentSongFile)),
                switchMap( async ([_, currentSongFile]) => {
                    await localforage.setItem('currentSongFileId', currentSongFile?.id || '');   
                })
            ),
        { dispatch: false }
    );

    importSongFile$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(importSongFile),
                withLatestFrom(this.store.select(selectSongFiles), this.store.select(selectSongTreeNodes)),
                switchMap(async ([{ file }, songFiles, songTreeNodes]) => {
                    // Save audio bytes to localforage
                    for (const audioFile of file.audioFiles){
                        await this.commonSongService.saveAudioBytes(audioFile.id, audioFile.bytes);
                    }
                    // Save song file to localforage
                    await localforage.setItem('songFiles', JSON.stringify(songFiles));
                    // song file is imported into downloads folder so safe that aswell
                    await localforage.setItem('songTreeNodes', JSON.stringify(songTreeNodes));
                }),
            ),
        { dispatch: false }
    );

}

