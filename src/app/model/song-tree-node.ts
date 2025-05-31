export interface SongTreeNode {
    name?: string;
    songId?: string;
    expanded?: boolean;
    children?: SongTreeNode[];
    isDownloadFolder?: boolean;
}