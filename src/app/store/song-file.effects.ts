import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, withLatestFrom, tap } from 'rxjs/operators';
import { createSongFile, editSongFile, loadSongFiles, saveSongFiles, setSongFiles } from './song-file.actions';
import { SongFile } from '../file-explorer/song-file.model';
import { selectSongFiles } from './song-file.feature';
import { Store } from '@ngrx/store';

@Injectable()
export class SongFileEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);

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

    saveSongsAfterChange$ = createEffect(() =>
        this.actions$.pipe(
            ofType(editSongFile, createSongFile),
            map(() => saveSongFiles())
        )
    );
}

