import { AudioFileWithBytes } from "./audio-file.model";
import { SongFile } from "./song-file.model";

export interface MuluFile {
  songFile: SongFile;
  audioFiles: AudioFileWithBytes[];
}