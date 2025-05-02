import { Component, Input } from '@angular/core';
import { SongFile } from '../../model/song-file.model';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { openSongFile } from '../../store/song-file.actions';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-song-file',
  imports: [MatIconModule, MatListModule],
  templateUrl: './song-file.component.html',
  styleUrl: './song-file.component.scss',
})
export class SongFileComponent {
  @Input() file!: SongFile;

  constructor(readonly store: Store, private router: Router) {}

  openSong() {
    this.store.dispatch(openSongFile(this.file.id));
    this.router.navigate(['/song']);
  }
}
