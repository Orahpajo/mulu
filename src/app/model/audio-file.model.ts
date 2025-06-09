export interface AudioFile {
    id: string;
    name: string;
    mimeType: string;
    /** Size in Bytes */
    size: number; 
}

export interface AudioFileWithBytes extends AudioFile {
    bytes: string;
}