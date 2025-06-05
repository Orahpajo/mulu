import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { defaultText, SongFile } from '../model/song-file.model';
import { selectCurrentSongFile, selectShowAudioFiles } from '../store/song-file.feature';
import { MatIconModule } from '@angular/material/icon';
import { editSongFile, showAudioFiles } from '../store/song-file.actions';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { SecondsToMmssPipe } from '../pipes/seconds-to-mmss.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { first } from 'rxjs';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';
import { SongBarComponent } from './song-bar/song-bar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AudibleMetronome } from '../utils/audible-metronome';
import { AudioFile } from '../model/audio-file.model';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CommonSongService } from '../services/common-song.service';
import { VoiceService } from '../services/voice.service';

const REACTION_TIME = .3;

@Component({
  selector: 'app-song-view',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule, MatIconModule,
    MatSliderModule,
    SecondsToMmssPipe,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    SongBarComponent,
    MatTooltipModule,
    MatSelectionList,
    MatProgressSpinnerModule,
  ],
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent implements OnInit, OnDestroy {

  @ViewChild('audioRef') audio?: ElementRef<HTMLAudioElement>;
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChildren('lineItem', { read: ElementRef }) lineItems!: QueryList<ElementRef>;

  private audibleMetronome = new AudibleMetronome();

  currentTime = 0;
  currentLine = -1;

  song: SongFile | null = null;

  textmode: 'edit' | 'mark' | 'view' | 'loop' = 'view';
  showAudioFiles = false;
  audioFileLoading = false;

  duration = 0;

  loopStart = -1;
  loopEnd = -1;

  atTop = true;
  atBottom = false;
  audioObjectUrl?: string;

  autoScrollPaused = false;
  private autoScrollTimeout?: any;

  isDragOver = false;

  showTextModeMenu = false;

  songBars: string[] = [];
  voices: Map<string, string> = new Map();
  maxVoiceWidth: string = '0px';
  buttonDisabledTooltip = 'Die vorgeladenen Lieder können nicht bearbeitet werden. Bitte kopiere das Lied.';

  constructor(readonly store: Store, readonly commonSongService: CommonSongService, readonly voiceService: VoiceService) { }

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

  deleteAudioFile(file: AudioFile) {
    // delete file from indexed db
    localforage.setItem(file.id,null);

    // Remove audiofile from song
    const updatedSong = this.song!.clone();
    updatedSong.audiofiles = updatedSong.audiofiles.filter(af => af.id !== file.id);
    this.store.dispatch(editSongFile(updatedSong));

    // select another file if the selected is deleted
    if (this.song?.selectedAudioFile?.id === file.id){
      this.song.selectedAudioFile = this.song.audiofiles[0] || null;
    }
  }

  ngOnInit() {
    this.updateTextModeMenu();
    window.addEventListener('resize', this.updateTextModeMenu.bind(this));

    this.store.select(selectCurrentSongFile)
      .pipe(first(song => !!song))
      .subscribe((song) => {
        this.textmode = song?.text === defaultText ? 'edit' : 'view';
        
        // show audiofiles upload field, if there are no audiofiles
        if(song.audiofiles.length === 0){
          this.store.dispatch(showAudioFiles());
        }
      });

    // Show Audio Files
    this.store.select(selectShowAudioFiles).subscribe((showAudioFiles) => {
      this.showAudioFiles = showAudioFiles;
    });

    // Current Song
    this.store.select(selectCurrentSongFile).subscribe((song) => {
      const selectedFileChanged = 
        // if there was no audio selected we will select it later so it changed
        !this.song?.selectedAudioFile ||
        // The new selected id exists and is different from the old one
        song?.selectedAudioFile?.id 
        && song.selectedAudioFile.id !== this.song?.selectedAudioFile?.id;
      
      this.song = song?.clone() || null;
      if (!this.song) return;

      // select an audiofile if not selected
      if (this.song && !this.song.selectedAudioFile){
        this.song.selectedAudioFile = this.song.audiofiles[0];
      }
      // did the selected audiofile change?
      if (selectedFileChanged && this.song.selectedAudioFile){
        this.loadAudioFile(this.song.selectedAudioFile.id);
      }

      // set the song text
      if (song?.text) {
        this.songBars = song.text.split('\n\n');
        this.voices = this.voiceService.createVoices(this.songBars);
        this.maxVoiceWidth = this.voiceService.calculateMaxVoiceWidth(this.voices);    
        this.songBars = this.songBars.filter(bar => !bar.toLowerCase().startsWith('voices:'));
      }
    });
  }

  private loadAudioFile(fileId: string) {
    this.audioFileLoading = true;
    localforage.getItem(fileId).then((bytes) => {
      if (bytes){
        this.updateAudioObjectUrl(bytes as string);
        this.audioFileLoading = false;
      } else {
        this.commonSongService.loadSongBytes(fileId)
          .subscribe(audioFile => {
            this.updateAudioObjectUrl(bytes as string);
            this.audioFileLoading = false;
          });
      }
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateTextModeMenu.bind(this));
  }

  updateTextModeMenu() {
    // Passe den Wert (z.B. 340) ggf. an die Breite deiner Buttons an
    this.showTextModeMenu = window.innerWidth < 340;
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
      this.setCurrentLine(lineNumber);
    } else if (this.textmode === 'loop') {
      // mark loop start if not marked
      if (this.loopStart < 0) {
        this.loopStart = lineNumber;
        // set current line if smaller than start
        if (this.currentLine < this.loopStart){
          this.setCurrentLine(this.loopStart);
        }
      // if loop start is marked mark loop end
      } else if (this.loopEnd < 0) {
        this.loopEnd = lineNumber;
        // set current line if larger than end
        if (this.currentLine > this.loopEnd){
          this.setCurrentLine(this.loopEnd);
        }
      // if start and end are marked start marking again
      } else {
        this.loopStart = lineNumber;
        this.loopEnd = -1;
      }
    }
  }

  private setCurrentLine(lineNumber: number) {
    const cueTime = this.song?.cues[lineNumber];
    if (cueTime) {
      this.audio!.nativeElement.currentTime = cueTime;
    }
  }

  /** Is the line between loop start and loop and, and thus should be marked? */
  isLineInLoop(lineNumber: number): boolean {
    // only in loop mode
    if (this.textmode !== 'loop') return false;

    return lineNumber >= this.loopStart && lineNumber <= this.loopEnd // line is within the loop
      || lineNumber === this.loopStart && this.loopEnd < 0 // no loop end yet and line is start of loop
  }

  isCurrentLine(lineNumber: number): boolean {
    return lineNumber === this.currentLine;
  }

  onTextScroll(container: HTMLElement) {
    this.atTop = container.scrollTop === 0;
    this.atBottom = container.scrollHeight - container.scrollTop === container.clientHeight;

    if (!this.autoScrollPaused && this.audio && !this.audio.nativeElement.paused) {
      this.autoScrollPaused = true;
      clearTimeout(this.autoScrollTimeout);
      this.autoScrollTimeout = setTimeout(() => {
        this.autoScrollPaused = false;
      }, 5000);
    }
  }

  togglePlay(audio: HTMLAudioElement) {
    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  onTimeUpdate(audio: HTMLAudioElement) {
    this.currentTime = audio.currentTime;

    // get current line
    for (let i = 0; i < this.song!.cues.length; i++) {
      const cue = this.song!.cues[i];
      let nextCue = this.nextValidCue(i);
      if (cue && cue <= this.currentTime && nextCue > this.currentTime) {
        this.currentLine = i;
        break;
      }
    }

    // need to loop?
    if (this.textmode === 'loop' && !audio.paused && this.loopStart >= 0) { // able to loop?
      if (this.currentTime > audio.duration - .1 // song ended?
        || this.currentTime > (this.song!.cues[this.loopEnd + 1] || 0)
      ) {
        audio.pause();

        if (!this.audibleMetronome.isRunning()) {
          console.log("Starte hörbares Metronom:");
          this.audibleMetronome.start(90, 4,
            (currentTick: number) => {
              console.log(`Hörbarer Tick ${currentTick}/4 (90 BPM)`);
            },
            // after ticks finished
            () => {
              this.currentLine = this.loopStart;
              this.currentTime = this.song?.cues[this.currentLine]!;
              audio.currentTime = this.currentTime;
              audio.play();
            }
          );
        } else {
          this.audibleMetronome.stop();
        }
      }
    }

    this.scrollToCurrentLine();
  }

  scrollToCurrentLine() {
    if (this.textmode !== 'view') return;
    if (this.autoScrollPaused) return; 
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

      // Save file bytes in indexedDB
      let bytes: string;
      bytes = await this.readFileAsBase64(file);

      await localforage.setItem(fileId, bytes);

      // Set file in Store
      const audioFile = { id: fileId, name: file.name, mimeType };
      updatedSong.audiofiles.push(audioFile);
      updatedSong.selectedAudioFile = audioFile;
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

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  private updateAudioObjectUrl(audioFileBytes: string) {
    if (this.audioObjectUrl) {
      URL.revokeObjectURL(this.audioObjectUrl);
      this.audioObjectUrl = undefined;
    }
    if (audioFileBytes && this.song?.selectedAudioFile?.mimeType) {
      const blob = this.base64ToBlob(audioFileBytes, this.song.selectedAudioFile.mimeType);
      this.audioObjectUrl = URL.createObjectURL(blob);
    }
  }

  onAudioFileSelected(event: any) {
    const selectedFile = event.options[0].value as AudioFile;
    if (this.song && selectedFile && this.song.selectedAudioFile?.id !== selectedFile.id) {
      const updatedSong = this.song.clone();
      updatedSong.selectedAudioFile = selectedFile;
      this.store.dispatch(editSongFile(updatedSong));
    }
  }
}
