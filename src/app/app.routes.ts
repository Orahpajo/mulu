import { Routes } from '@angular/router';
import { SongViewComponent } from './song-view/song-view.component';
import { HelpPageComponent } from './help-page/help-page.component';

export const routes: Routes = [
    { path: '', component: HelpPageComponent, pathMatch: 'full' },
    { path: 'song', component: SongViewComponent, pathMatch: 'full' },
];
