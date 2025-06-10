import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, first, forkJoin, map, Observable, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { SongFile } from '../model/song-file.model';
import { MuluFile } from '../model/mulu-file.model';
import { AudioFileWithBytes } from '../model/audio-file.model';
import localforage from 'localforage';

export interface SongMetaData {
  name: string,
  lastEdit: Date,
}

@Injectable({
  providedIn: 'root',
})
export class CommonSongService {

  songFileNames: SongMetaData[] = [
    { name: 'I_3 Facade - Choreo.mulu', lastEdit: new Date(2025, 6, 10, 23, 0) },
    { name: 'I_5 Tratsch.mulu', lastEdit: new Date(2025, 6, 10, 17, 0) },
    { name: 'I_12 Schaff die Männer ran.mulu', lastEdit: new Date(2025, 6, 10, 17, 0) },
    { name: 'II_24 Mörder Mörder.mulu', lastEdit: new Date(2025, 6, 10, 17, 0) },
    { name: 'II_24 Mörder Mörder - Choreo.mulu', lastEdit: new Date(2025, 6, 10, 23, 0) },
  ];

  constructor(private http: HttpClient, private store: Store) { }

  loadCommonSongs(): Observable<SongFile[]> {
    const requests = this.songFileNames.map(fileName =>
      this.http.get<MuluFile>(`/commonSongs/${fileName.name}`).pipe(
        map(song => {
          const songFile = song.songFile;

          return new SongFile(songFile.name, songFile.id, songFile.audiofiles, songFile.text, songFile.cues, true, songFile.selectedAudioFile?.id || null, fileName.lastEdit);
        }),
        catchError(err => {
          console.log(err);
          return EMPTY;
        })
      )
    );

    return forkJoin(requests);
  }

  loadSongBytes(fileId: string): Observable<AudioFileWithBytes> {
    return this.http.get<AudioFileWithBytes>(`/commonSongs/${fileId}.json`)
  }

  loadAudioFileFromLocal(fileId: string) {
    return new Observable((subscriber) => {
      localforage.getItem(fileId).then(bytes => {
        if (bytes) {
          subscriber.next(bytes);
          subscriber.complete();
        } else {
          subscriber.error()
        }
      })
    });
  }

  loadAudiFilesFromRemote(fileId: string) {
    return this.loadSongBytes(fileId).pipe(tap(file => {
      // cache bytes in localforage
      localforage.setItem(fileId, file.bytes);
    }
    ));
  }

  saveAudioFile(fileId: string, file: File) {
    return this.readFileAsBase64(file)
      .then(bytes => localforage.setItem(fileId, bytes));
  }

  saveAudioBytes(fileId: string, bytes: string) {
    return localforage.setItem(fileId, bytes);
  }

  deleteAudioBytes(fileId: string){
    return localforage.removeItem(fileId);
  }

  base64ByteLength(base64: string): number {
    // remove possible data url prefix
    const cleaned = base64.split(',').pop() || '';
    // calculate length
    const padding = (cleaned.match(/=+$/) || [''])[0].length;
    return (cleaned.length * 3) / 4 - padding;
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }


  async shareSong(currentSongFile: SongFile) {
    // Load Audio Files
    const audioFiles: AudioFileWithBytes[] = [];
    for (const audioFile of currentSongFile.audiofiles) {
      const bytes = await localforage.getItem(audioFile.id)
      if (!bytes) {
        alert('Bitte lade erst alle Lieddateien herunter.');
        return;
      }
      const audioFileWithBytes = {
        ...audioFile,
        bytes: bytes as string,
        size: this.base64ByteLength(bytes as string)
      };
      audioFiles.push(audioFileWithBytes);
    }
    const fileName = this.sanitizeFileName(currentSongFile.name) + '.mulu';
    const muluFile: MuluFile = {
      songFile: currentSongFile,
      audioFiles,
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
  }

  private sanitizeFileName(name: string): string {
    // Remove invalid characters and replace spaces with underscores
    return name.replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, '_');
  }
}
