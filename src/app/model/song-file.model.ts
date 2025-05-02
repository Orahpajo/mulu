import { v4 as uuidv4 } from 'uuid';
import { AudioFile } from './audio-file.model';

export class SongFile {
    constructor(
        public name: string,
        public children: SongFile[],
        public id: string,
        public audiofiles: AudioFile[],
        public text: string,
    ) {}

    static create(
        name: string,
        children: SongFile[] = [],
        audiofiles: AudioFile[] = [],
        id: string = uuidv4(),
        text: string = '',
    ): SongFile {
        return new SongFile(name, children, id, audiofiles, text);
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
            this.text
        );
    }
}