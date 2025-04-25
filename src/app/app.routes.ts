import { Routes } from '@angular/router';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { SongFileComponent } from './file-explorer/song-file/song-file.component';
import { SongViewComponent } from './song-view/song-view.component';

export const routes: Routes = [
    { path: '', component: FileExplorerComponent, pathMatch: 'full' },
    { path: 'song', component: SongViewComponent, pathMatch: 'full' },
];
