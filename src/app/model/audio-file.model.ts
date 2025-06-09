export interface AudioFile {
    id: string;
    name: string;
    mimeType: string;
}

export interface AudioFileWithBytes extends AudioFile {
    bytes: string;
    /** Size in Bytes */
    size: number; 
}