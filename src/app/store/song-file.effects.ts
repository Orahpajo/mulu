import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, withLatestFrom, tap, switchMap } from 'rxjs/operators';
import { createSongFile, deleteSongFile, deleteSongFileWithQuestion, editSongFile, loadSongFiles, saveSongFiles, setSongFiles } from './song-file.actions';
import { SongFile } from '../file-explorer/song-file.model';
import { selectSongFiles } from './song-file.feature';
import { Store } from '@ngrx/store';
import { Dialog } from '@angular/cdk/dialog';
import { YesNoDialogComponent } from '../yes-no-dialog/yes-no-dialog.component';
import { Router } from '@angular/router';

@Injectable()
export class SongFileEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private dialog = inject(Dialog);
    private router = inject(Router);

    loadSongFiles$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadSongFiles),
            map(() => {
                const data = localStorage.getItem('songFiles');
                let songFiles: SongFile[] = [];
                if (data) {
                    const arr = JSON.parse(data);
                    songFiles = arr.map((obj: any) =>
                        new SongFile(obj.name, obj.children, obj.id)
                    );
                }
                return setSongFiles(songFiles);
            })
        )
    );

    saveSongFiles$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(saveSongFiles),
                withLatestFrom(this.store.select(selectSongFiles)),
                tap(([_, songFiles]) => {
                    localStorage.setItem('songFiles', JSON.stringify(songFiles));
                })
            ),
        { dispatch: false }
    );

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
            ofType(editSongFile, createSongFile, deleteSongFile),
            map(() => saveSongFiles())
        )
    );
}

