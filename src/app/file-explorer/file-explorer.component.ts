import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { closeCurrentSongFile, createSongFile, openSongFile } from '../store/song-file.actions';
import { selectSongFiles, selectSongTreeNodes } from '../store/song-file.feature';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, find, map, Observable, Subject, takeUntil, timeout } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import {MatTreeModule, MatTreeNestedDataSource} from '@angular/material/tree';
import { SongTreeNode } from '../model/song-tree-node';
import { SongFile } from '../model/song-file.model';
import { ViewChild } from '@angular/core';
import { MatTree } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';


@Component({
  selector: 'app-file-explorer',
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatListModule,
    MatTreeModule,
    RouterModule,
  ],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.scss',
})
export class FileExplorerComponent implements OnInit, OnDestroy {

  @Input()
  sidenavOpen: boolean;
  @Output()
  sidenavOpenChange = new EventEmitter<boolean>();

  private destroy$ = new Subject<void>();

  songs: SongFile[];

  dataSource = new MatTreeNestedDataSource<SongTreeNode>();

  childrenAccessor = (node: SongTreeNode) => node.children ?? [];
  hasChild = (_: number, node: SongTreeNode) => !!node.children && node.children.length > 0;


  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.store.select(selectSongFiles)
      .pipe(takeUntil(this.destroy$))
      .subscribe(songs => this.songs = songs);
    this.store.select(selectSongTreeNodes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(treeNodes => {
        this.dataSource.data = treeNodes;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  newSong() {
    this.store.dispatch(createSongFile());
    this.router.navigate(['/song']);
    this.sidenavOpenChange.emit(false);
  }

   openSong(songId: string) {
    this.store.dispatch(openSongFile(songId));
    this.router.navigate(['/song']);
    this.sidenavOpenChange.emit(false);
  }

  openHelpPage() {
    this.router.navigate(['/']);
    this.sidenavOpenChange.emit(false);  
    this.store.dispatch(closeCurrentSongFile());
  }

  songNameById(songId: string) {
    return this.songs
      .find(song => song.id === songId)
      ?.name ?? 'ERROR ' + songId;
  }
  
}
