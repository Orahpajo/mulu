import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { defaultText, SongFile } from '../model/song-file.model';
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
import { MatListModule } from '@angular/material/list';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';
import { SongBarComponent } from './song-bar/song-bar.component';
import { CommonSongService } from '../../services/common-song.service';

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
    SongBarComponent
  ],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent implements OnInit, OnDestroy {

  @ViewChild('audioRef') audio?: ElementRef<HTMLAudioElement>;
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChildren('lineItem', { read: ElementRef }) lineItems!: QueryList<ElementRef>;
  
  currentTime = 0;
  currentLine = -1;

  song: SongFile | null = null; 

  textmode: 'edit' | 'mark' | 'view' = 'view';

  duration = 0;
  isPlaying: any;

  atTop = true;
  atBottom = false;
  audioFileBytes?: string;

  isDragOver = false;

  showTextModeMenu = false;

  songBars: string[] = [];
  voices: Map<string, string> = new Map();
  maxVoiceWidth: string = '0px';
    
  constructor(readonly store: Store, readonly commonSongService: CommonSongService) {}

  onFileDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onFileDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.onFileSelected({ target: { files: event.dataTransfer.files } } as any);
    }
  }

  ngOnInit() {
    this.updateTextModeMenu();
    window.addEventListener('resize', this.updateTextModeMenu.bind(this));
  
    this.store.select(selectCurrentSongFile)
      .pipe(first(song => !!song))
      .subscribe((song) => {
        this.textmode = song?.text === defaultText ? 'edit' : 'view';
        const fileId = song?.audiofiles[0]?.id;
        if (fileId) {
          localforage.getItem(fileId).then((bytes) => {
            if (bytes)
              this.audioFileBytes = bytes as string;
            else 
              this.commonSongService.loadSongBytes(fileId)
                .subscribe(audioFile => {
                  this.audioFileBytes = audioFile.bytes as string; 
                })
            
          });
        } 
      });

    this.store.select(selectCurrentSongFile).subscribe((song) => {
      this.song = song?.clone() || null;
      if (song?.text) {
        this.songBars = song.text.split('\n\n');
        this.createVoices();
      }
    });
  }

  createVoices() {
    this.voices.clear();
    const voiceBar = this.songBars.find(bar => bar.toLowerCase().startsWith('voices:'));
    if (!voiceBar) return;

    const lines = voiceBar.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([a-z]*):\s*(.+)$/i);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        this.voices.set(key, value);
      }
    }

    this.calculateMaxVoiceWidth();

    this.songBars = this.songBars.filter(bar => !bar.toLowerCase().startsWith('voices:'));
  }

  calculateMaxVoiceWidth() {
    const longestVoice = Array.from(this.voices.keys()).reduce((a, b) => (a.length > b.length ? a : b), '');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = 'bold 14px monospace';
      this.maxVoiceWidth = `${context.measureText(longestVoice).width }px`;
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateTextModeMenu.bind(this));
  }
  
  updateTextModeMenu() {
    // Passe den Wert (z.B. 340) ggf. an die Breite deiner Buttons an
    this.showTextModeMenu = window.innerWidth < 340;
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
    if (!this.audio?.nativeElement) return;
    
    if (this.textmode === 'mark' && this.song) {
      // add cue if song is playing or paused and has no cue yet
      if (!this.audio.nativeElement.paused || this.song.cues[lineNumber] === undefined) {
        this.song.addCue(lineNumber, this.audio.nativeElement.currentTime - REACTION_TIME);
      } else {
        // remove cue if song is paused and has a cue
        this.song.cues[lineNumber] = undefined;
      }
      this.store.dispatch(editSongFile(this.song));
    } else if (this.textmode === 'view') {
      const cueTime = this.song?.cues[lineNumber];
      if (cueTime) {
        this.audio.nativeElement.currentTime = cueTime;
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
      if (cue && cue <= this.currentTime && nextCue > this.currentTime) {
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
    const item = current.nativeElement as HTMLElement;
  
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
      return this.song!.cues[lineNumber + 1]!;
    }
    return this.nextValidCue(lineNumber + 1);
  }
  
  onLoadedMetadata(audio: HTMLAudioElement) {
    this.duration = audio.duration;
  }
  
  onSeek(event: any, audio: HTMLAudioElement) {
    const value = event.value ?? event.target.value; 
    this.currentTime = value;
    audio.currentTime = value;
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.song) {
      // Load File
      const file = input.files[0];
      const mimeType = file.type; 

      if (!(mimeType.startsWith('audio/') || mimeType.startsWith('video/'))) {
        alert('Nur Audio- oder Videodateien werden unterstützt.');
        return;
      } 
     
      // Save File Metadata in song
      const updatedSong = this.song.clone();
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
