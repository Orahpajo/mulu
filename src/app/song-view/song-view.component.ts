import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { SongFile } from '../model/song-file.model';
import { selectCurrentSongFile } from '../store/song-file.feature';
import { MatIconModule } from '@angular/material/icon';
import { editSongFile } from '../store/song-file.actions';
import { CommonModule } from '@angular/common';
import {MatSliderModule} from '@angular/material/slider';
import { SecondsToMmssPipe } from '../pipes/seconds-to-mmss.pipe';
import { MatButtonModule } from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import { first } from 'rxjs';
import { MatListItem, MatListModule } from '@angular/material/list';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';

const REACTION_TIME = .3;

@Component({
  selector: 'app-song-view',
  imports: [
    CommonModule, 
    FormsModule,
    MatButtonModule ,MatIconModule,
    MatSliderModule,
    SecondsToMmssPipe,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
  ],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent implements OnInit {

  @ViewChild('audioRef') audio?: ElementRef<HTMLAudioElement>;
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChildren('lineItem') lineItems!: QueryList<MatListItem>;
  
  currentTime = 0;
  currentLine = -1;

  song: SongFile | null = null; 

  textmode: 'edit' | 'mark' | 'view' = 'view';

  duration = 0;
  isPlaying: any;

  atTop = true;
  atBottom = false;
  audioFileBytes?: string;
  
  constructor(readonly store: Store) {}

  ngOnInit() {
    this.store.select(selectCurrentSongFile).subscribe((song) => {
      this.song = song?.clone() || null;
      const fileId = this.song?.audiofiles[0]?.id;
      if (fileId) {
        localforage.getItem(fileId).then((bytes) => {
          this.audioFileBytes = bytes as string;
        });
      }
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

  saveText() {
    this.store.select(selectCurrentSongFile)
    .pipe(first())
    .subscribe((song) => {
      if (this.song && song && song.text !== this.song?.text) {
        this.store.dispatch(editSongFile(this.song));
      }
    });
  }

  onLineClick(lineNumber: number) {
    if (!this.audio) return;
    
    if (this.textmode === 'mark' && this.song) {
      this.song.addCue(lineNumber, this.audio.nativeElement.currentTime - REACTION_TIME);
      this.store.dispatch(editSongFile(this.song));
    } else if (this.textmode === 'view') {
      const cueTime = this.song?.cues[lineNumber];
      if (cueTime) {
        this.audio.nativeElement.currentTime = cueTime + 1;
      }
    }
  }

  isCurrentLine(lineNumber: number): boolean {
    return lineNumber === this.currentLine;
  }
      
  onTextScroll(container: HTMLElement) {
    this.atTop = container.scrollTop === 0;
    this.atBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
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
    for (let i = 0; i < this.song!.cues.length; i++) {
      const cue = this.song!.cues[i];
      let nextCue = this.nextValidCue(i);
      if (cue <= audio.currentTime && nextCue > audio.currentTime) {
        this.currentLine = i;
        this.scrollToCurrentLine(); 
        break;
      }
    }
  }

  scrollToCurrentLine() {
    if (this.textmode !== 'view') return;
    if (!this.scrollContainer || !this.lineItems) return;
    const current = this.lineItems.get(this.currentLine);
    if (!current) return;
  
    const container = this.scrollContainer.nativeElement;
    // MatListItem statt ElementRef!
    const item = current._elementRef.nativeElement as HTMLElement;
  
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const offset = itemRect.top - containerRect.top;
    const scroll = offset - container.clientHeight / 2 + item.clientHeight / 2;
  
    const targetScroll = Math.max(
      0,
      Math.min(container.scrollHeight - container.clientHeight, container.scrollTop + scroll)
    );
    container.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }

  nextValidCue(lineNumber: number): number {
    if (this.song!.cues.length <= lineNumber) {
      return this.duration;
    }
    if (this.song!.cues[lineNumber + 1]) {
      return this.song!.cues[lineNumber + 1];
    }
    return this.nextValidCue(lineNumber + 1);
  }
  
  onLoadedMetadata(audio: HTMLAudioElement) {
    this.duration = audio.duration;
  }
  
  onSeek(event: any, audio: HTMLAudioElement) {
    const value = event.value ?? event.target.value;
    audio.currentTime = value;
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.song) {
      // Load File
      const file = input.files[0];
      // Save File Metadata in song
      const updatedSong = this.song.clone();
      const mimeType = file.type; 
      const fileId = uuidv4();
      updatedSong.audiofiles.push({ id: fileId ,name: file.name, mimeType });
      this.store.dispatch(editSongFile(updatedSong));
      // Save file bytes in indexedDB
      let bytes: string;
      bytes = await this.readFileAsBase64(file);
      
      localforage.setItem(fileId, bytes);
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

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error('Fehler beim Lesen des Blobs.'));
      };
      reader.onload = () => {
        // reader.result ist dann ein data:URL-String, z.B. "data:video/webm;base64,...."
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }
}
