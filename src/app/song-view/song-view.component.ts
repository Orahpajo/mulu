import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SongFile } from '../model/song-file.model';
import { selectCurrentSongFile } from '../store/song-file.feature';
import { MatIconModule } from '@angular/material/icon';
import { editSongFile } from '../store/song-file.actions';

@Component({
  selector: 'app-song-view',
  imports: [MatIconModule],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent implements OnInit {
  
  isPlaying: any;
  song: SongFile | null = null;

  constructor(readonly store: Store) {}

  ngOnInit() {
    this.store.select(selectCurrentSongFile).subscribe((song) => {
      this.song = song;
    });
  }

  togglePlay(audio: HTMLAudioElement) {
    if (this.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  async onAudioFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.song) {
      const file = input.files[0];
      const bytes = await this.readFileAsBase64(file);
      const updatedSong = this.song.clone();
      const mimeType = file.type; 
      updatedSong.audiofiles.push({ name: file.name, bytes, mimeType });
      this.store.dispatch(editSongFile(updatedSong));
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
