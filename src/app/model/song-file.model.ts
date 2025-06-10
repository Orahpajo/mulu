import { v4 as uuidv4 } from 'uuid';
import { AudioFile } from './audio-file.model';

export const defaultText = 
    'voices:\n' + 
    '  s: red\n' +
    '  a: gold\n' +
    '  t: lime\n' +
    '  b: fuchsia\n' +
    '\n' +
    'Erste Songzeile\n' +
    's: Sopran\n' +
    'a: Alt\n' +
    't: Tenor\n' +
    'b: Bass\n';

export class SongFile {
    constructor(
        public name: string,
        public id: string,
        public audiofiles: AudioFile[],
        public text: string,
        public cues: (number | undefined)[],
        /** Is it a song, that is shared via the server */
        public isCommonSong: boolean,
        private selectedAudioFileId: string | null,
        public lastEdit?: Date
    ) {}

    static create(
        name: string,
        audiofiles: AudioFile[] = [],
        id: string = uuidv4(),
        text: string = defaultText,
        cues: (number | undefined)[] = [],
        isCommonSong = false,
        selectedAudioFileId: string | null = null,
        lastEdit = null,
    ): SongFile {
        return new SongFile(name, id, audiofiles, text, cues, isCommonSong, selectedAudioFileId, lastEdit);
    }

    clone(): SongFile {
        return new SongFile(
            this.name,
            this.id,
            [...this.audiofiles],
            this.text,
            [...this.cues],
            this.isCommonSong,
            this.selectedAudioFileId,
            this.lastEdit
        );
    }

    addCue(lineNumber: number, time: number) {
        if (this.cues.length <= lineNumber) {
            this.cues.length = lineNumber + 1;
        }
        this.cues[lineNumber] = time;
    }

    isDirectory() {
        return false;
    }

    get selectedAudioFile(){
        return this.audiofiles.find(af => af.id === this.selectedAudioFileId) || null;
    }

    set selectedAudioFile(audioFile: AudioFile | null){
        if (audioFile && !this.audiofiles.find(af => af.id === audioFile?.id)){
            this.audiofiles.push(audioFile);
        }
        this.selectedAudioFileId = audioFile?.id || null;
    }
}