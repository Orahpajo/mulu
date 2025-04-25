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
}