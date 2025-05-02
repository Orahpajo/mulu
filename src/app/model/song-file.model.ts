import { v4 as uuidv4 } from 'uuid';
import { AudioFile } from './audio-file.model';

export class SongFile {
    constructor(
        public name: string,
        public children: SongFile[] = [],
        public id: string = uuidv4(),
        public audiofiles: AudioFile[] = [],
    ) {}

    isDirectory(): boolean {
        return this.children.length > 0;
    }

    clone(): SongFile {
        return new SongFile(this.name, this.children.map(child => child.clone()), this.id);
    }
}