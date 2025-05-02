import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SongFile } from '../model/song-file.model';
import { selectCurrentSongFile } from '../store/song-file.feature';
import { MatIconModule } from '@angular/material/icon';
import { editSongFile } from '../store/song-file.actions';
import { CommonModule } from '@angular/common';
import {MatSliderModule} from '@angular/material/slider';
import { SecondsToMmssPipe } from '../pipes/seconds-to-mmss.pipe';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-song-view',
  imports: [CommonModule, MatButtonModule ,MatIconModule, MatSliderModule, SecondsToMmssPipe],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent implements OnInit {
  
  song: SongFile | null = null; 

  textmode: 'edit' | 'mark' | 'view' = 'view';

  currentTime = 0;
  duration = 0;
  isPlaying: any;

  constructor(readonly store: Store) {}

  ngOnInit() {
    this.store.select(selectCurrentSongFile).subscribe((song) => {
      this.song = song;
    });
  }

  toggleTextMode() {
    switch (this.textmode) {
      case 'edit':
        this.textmode = 'mark';
        break;
      case 'mark':
        this.textmode = 'view';
        break;
      case 'view':
        this.textmode = 'edit';
        break;
    }
  }

  togglePlay(audio: HTMLAudioElement) {
    if (this.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  onTimeUpdate(audio: HTMLAudioElement) {
    this.currentTime = audio.currentTime;
  }
  
  onLoadedMetadata(audio: HTMLAudioElement) {
    this.duration = audio.duration;
  }
  
  onSeek(event: any, audio: HTMLAudioElement) {
    const value = event.value ?? event.target.value;
    audio.currentTime = value;
    this.currentTime = value;
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
