import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { SongFile } from '../file-explorer/song-file.model';
import { selectSongFile } from '../store/song-file.feature';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-song-view',
  imports: [],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent {
  song?: SongFile;

  constructor(store: Store, route: ActivatedRoute) {
    route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        store.select(selectSongFile({ id })).subscribe((song) => {
          this.song = song;
        });
      }
    });
  }
}
