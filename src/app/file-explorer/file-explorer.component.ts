import { Component } from '@angular/core';
import { SongFile } from '../model/song-file.model';
import { SongFileComponent } from './song-file/song-file.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { closeCurrentSongFile, createSongFile } from '../store/song-file.actions';
import { selectSongFiles } from '../store/song-file.feature';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { version } from '../../environment/version'


@Component({
  selector: 'app-file-explorer',
  imports: [SongFileComponent, MatButtonModule, MatIconModule, CommonModule, MatListModule],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.scss',
})
export class FileExplorerComponent {
  appVersion = version;
  songs$: Observable<SongFile[]>;

  constructor(private store: Store, private router: Router) {
    // if the user just navigated back, the current song file needs to be closed
    this.store.dispatch(closeCurrentSongFile());
    this.songs$ = this.store.select(selectSongFiles);
  }

  newSong() {
    this.store.dispatch(createSongFile());
    this.router.navigate(['/song']);
  }
}
