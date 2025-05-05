import {Component} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import { Store } from '@ngrx/store';
import { selectCurrentSongFile, selectEditNameMode } from '../store/song-file.feature';
import { Observable } from 'rxjs';
import { SongFile } from '../model/song-file.model';
import { CommonModule } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { deleteSongFileWithQuestion, editSongFile, importSongFile, toggleEditNameMode } from '../store/song-file.actions';
import { RouterModule } from '@angular/router';
import { MuluFile } from '../model/mulu-file.model';
import localforage from 'localforage';

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

  shareSong(currentSongFile: SongFile) {
    if (!currentSongFile?.audiofiles[0]) return;

    // Load Audio Files
    localforage.getItem(currentSongFile.audiofiles[0].id).then((bytes) => {
      const fileName = this.sanitizeFileName(currentSongFile.name) + '.mulu';
      const muluFile: MuluFile = {
        songFile: currentSongFile,
        audioFiles: [
          {
            ...currentSongFile.audiofiles[0],
            bytes: bytes as string,
          }
        ],
      };
      const fileContent = JSON.stringify(muluFile, null, 2);
      const file = new File([fileContent], fileName, { type: 'application/json' });
    
      // Check if the browser supports the Web Share API
      navigator.share({
        files: [file],
        title: currentSongFile.name,
        text: 'Mulu Song File',
      }).catch(() => {
        console.log('Web Share API not supported, falling back to download');
        // Fallback: Download
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      })
    });
  }

  private sanitizeFileName(name: string): string {
    // Remove invalid characters and replace spaces with underscores
    return name.replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, '_');
  }

  importSong(){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '';
    input.style.display = 'none';

    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const muluFile: MuluFile = JSON.parse(text);
        this.store.dispatch(importSongFile(muluFile));
        // Hier kannst du das MuluFile weiterverarbeiten, z.B. in den Store laden
      } catch (e) {
        alert('Datei konnte nicht gelesen werden (kein gültiges Mulu-Format)');
      }
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => document.body.removeChild(input), 1000);
  }

}
