import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, withLatestFrom, switchMap } from 'rxjs/operators';
import { closeCurrentSongFile, createSongFile, deleteSongFile, deleteSongFileWithQuestion, duplicateSongFile, editSongFile, importSongFile, loadSongFiles, openSongFile, saveSongFiles, setSongFiles } from './song-file.actions';
import { SongFile } from '../model/song-file.model';
import { selectCurrentSongFile, selectSongFiles } from './song-file.feature';
import { Store } from '@ngrx/store';
import { Dialog } from '@angular/cdk/dialog';
import { YesNoDialogComponent } from '../yes-no-dialog/yes-no-dialog.component';
import { Router } from '@angular/router';
import localforage from 'localforage';
import { CommonSongService } from '../../services/common-song.service';
import { from } from 'rxjs';


@Injectable()
export class SongFileEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private dialog = inject(Dialog);
    private router = inject(Router);
    private commonSongService = inject(CommonSongService);

    loadSongFiles$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadSongFiles),
            switchMap(() =>
            from(localforage.getItem<string>('songFiles')).pipe(
                switchMap((data) => {
                    let songFiles: SongFile[] = [];
                    if (data) {
                        const arr = JSON.parse(data);
                        songFiles = arr.map((obj: any) =>
                        new SongFile(obj.name, obj.children, obj.id, obj.audiofiles, obj.text, obj.cues, obj.isCommonSong));
                    }

                    return from(localforage.getItem<string>('currentSongFileId')).pipe(
                        switchMap((currentSongFileId) => {
                        const currentSongFile = songFiles.find((file) => file.id === currentSongFileId) || null;

                        return this.commonSongService.loadCommonSongs().pipe(
                            map((loadedSongFiles) => {
                                return setSongFiles([...loadedSongFiles, ...songFiles], currentSongFile)
                            })
                        );
                        })
                    );
                })
            )
            )
        )
    );

    saveSongFiles$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(saveSongFiles),
                withLatestFrom(this.store.select(selectSongFiles)),
                switchMap(async ([_, songFiles]) => {
                    await localforage.setItem('songFiles', JSON.stringify(songFiles));
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
                   return this.dialog.open(YesNoDialogComponent, {
                        width: '300px',
                        data: {
                            question: 'Song wirklich löschen?',
                        }
                        }).closed.pipe(
                            map((result) => {
                                if (result === 'true') {
                                    this.router.navigate(['/']);
                                    return deleteSongFile(file);
                                } else {
                                    return { type: 'NO_ACTION' };
                                }
                            }
                        )
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
                withLatestFrom(this.store.select(selectSongFiles)),
                switchMap(async ([{ file }, songFiles]) => {
                    // Save audio bytes to localforage
                    await localforage.setItem(file.audioFiles[0].id, file.audioFiles[0].bytes);
                    // Save song file to localforage
                    await localforage.setItem('songFiles', JSON.stringify(songFiles));
                }),
            ),
        { dispatch: false }
    );

}

