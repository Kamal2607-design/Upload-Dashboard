import { Routes } from '@angular/router';
import { VideoListComponent } from './video/video-list/video-list';
import { VideoViewComponent } from './video/video-view/video-view';

export const routes: Routes = [
  { path: '', component: VideoListComponent },
  {
  path: 'video/:id',
  component: VideoViewComponent
  }
];