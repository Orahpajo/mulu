import { v4 as uuidv4 } from 'uuid';

export class SongFile {
    constructor(
        public name: string,
        public children: SongFile[] = [],
        public id: string = uuidv4(),
    ) {}

    isDirectory(): boolean {
        return this.children.length > 0;
    }

    clone(): SongFile {
        return new SongFile(this.name, this.children.map(child => child.clone()), this.id);
    }
}