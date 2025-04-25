import { Component } from '@angular/core';
import { SongFile } from './song-file.model';
import { SongFileComponent } from './song-file/song-file.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { v4 as uuidv4 } from 'uuid';
import { Store } from '@ngrx/store';
import { createSongFile } from '../store/song-file.actions';
import { selectLatestSongFile, selectSongFiles } from '../store/song-file.feature';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-explorer',
  imports: [SongFileComponent, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.scss',
})
export class FileExplorerComponent {
  songs$: Observable<SongFile[]>;

  constructor(private store: Store, private router: Router) {
    this.songs$ = this.store.select(selectSongFiles);
  }

  newSong() {
    this.store.dispatch(createSongFile());
    this.store.select(selectLatestSongFile).subscribe((songFile) => {
      this.router.navigate(['/song', songFile.id]);
    });
  }
}
