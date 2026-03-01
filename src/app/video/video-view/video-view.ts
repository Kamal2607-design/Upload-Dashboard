import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from '../video';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-view.html',
  styleUrls: ['./video-view.css']
})
export class VideoViewComponent implements OnInit {

  video: any;

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.videoService.getVideos().subscribe(data => {
      this.video = data.find(v => v.id === id);
    });
  }
}