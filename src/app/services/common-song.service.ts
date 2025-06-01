import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { SongFile } from '../model/song-file.model';
import { MuluFile } from '../model/mulu-file.model';
import { AudioFileWithBytes } from '../model/audio-file.model';

@Injectable({
  providedIn: 'root',
})
export class CommonSongService {
  
  songFileNames: string[] = [
    'I_5 Tratsch.mulu',
    'I_12 Schaff die Männer ran.mulu',
    'II_24 Mörder Mörder.mulu',
  ];
  
  constructor(private http: HttpClient,private store: Store) { }
  
  loadCommonSongs(): Observable<SongFile[]> {
    const requests = this.songFileNames.map(fileName =>
      this.http.get<MuluFile>(`/commonSongs/${fileName}`).pipe(
        map(song => {
          const songFile = song.songFile;
          
          return new SongFile(songFile.name, songFile.id, songFile.audiofiles, songFile.text, songFile.cues, true, songFile.selectedAudioFile?.id || null);
        })
      )
    );

    return forkJoin(requests);
  }
  
  loadSongBytes(fileId: string): Observable<AudioFileWithBytes> {
    return this.http.get<AudioFileWithBytes>(`/commonSongs/${fileId}.json`)
  }
}
