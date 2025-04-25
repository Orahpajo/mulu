import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SongFile } from '../file-explorer/song-file.model';
import { selectCurrentSongFile } from '../store/song-file.feature';

@Component({
  selector: 'app-song-view',
  imports: [],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent implements OnInit {
  song: SongFile | null = null;

  constructor(readonly store: Store) {}

  ngOnInit() {
    this.store.select(selectCurrentSongFile).subscribe((song) => {
      this.song = song;
    });
  }
}
