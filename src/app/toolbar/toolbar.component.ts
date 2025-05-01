import {Component} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import { Store } from '@ngrx/store';
import { selectCurrentSongFile, selectEditNameMode } from '../store/song-file.feature';
import { Observable } from 'rxjs';
import { SongFile } from '../file-explorer/song-file.model';
import { CommonModule } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { deleteSongFileWithQuestion, editSongFile, toggleEditNameMode } from '../store/song-file.actions';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {

  currentSongFile: SongFile | null = null;
  editSongTitleMode$: Observable<boolean>;

  constructor(readonly store: Store) {
    this.store.select(selectCurrentSongFile).subscribe((currentSongFile) => {
      this.currentSongFile = currentSongFile?.clone() || null;
    });
    this.editSongTitleMode$ = this.store.select(selectEditNameMode);
  }

  toggleEditSongNameMode(currentSongFile: SongFile ,editSongTitleMode: boolean | null) {
    if (editSongTitleMode) {
      this.store.dispatch(editSongFile(currentSongFile))
    }
    this.store.dispatch(toggleEditNameMode());
  }

  deleteSong(currentSongFile: SongFile) {
    if (currentSongFile) {
      this.store.dispatch(deleteSongFileWithQuestion(currentSongFile));
    }
  }
}
