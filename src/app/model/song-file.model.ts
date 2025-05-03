import { v4 as uuidv4 } from 'uuid';
import { AudioFile } from './audio-file.model';

export class SongFile {
    constructor(
        public name: string,
        public children: SongFile[],
        public id: string,
        public audiofiles: AudioFile[],
        public text: string,
        public cues: Map<number, number>,
    ) {}

    static create(
        name: string,
        children: SongFile[] = [],
        audiofiles: AudioFile[] = [],
        id: string = uuidv4(),
        text: string = '',
        cues: Map<number, number> = new Map<number, number>(),
    ): SongFile {
        return new SongFile(name, children, id, audiofiles, text, cues);
    }

    isDirectory(): boolean {
        return this.children.length > 0;
    }

    clone(): SongFile {
        return new SongFile(
            this.name,
            this.children.map(child => child.clone()),
            this.id,
            [...this.audiofiles],
            this.text,
            this.cues?.entries()? new Map<number, number>(this.cues.entries()) : new Map<number, number>(),
        );
    }
}