import { Component } from '@angular/core';
import { VideoService } from '../video';
import { MatDialogModule,MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatProgressBarModule, FormsModule],
  templateUrl: './upload-dialog.html',
  styleUrls: ['./upload-dialog.css']
})
export class UploadDialogComponent implements OnInit {

  uploadProgress: number = 0;
  selectedFile: File | null = null;

  constructor(private videoService: VideoService,  
  private dialogRef: MatDialogRef<UploadDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any
) {}

  isEditMode: boolean = false;
  title: string = '';

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  ngOnInit(): void {
  if (this.data) {
    this.isEditMode = true;
    this.title = this.data.title;
  }
}

async upload() {
  // EDIT MODE
  if (this.isEditMode) {
    await this.videoService.updateVideo(this.data.id, {
      title: this.title
    });

    this.dialogRef.close(true);
    return;
  }

  // UPLOAD MODE
  if (!this.selectedFile) return;

  await this.videoService.uploadVideo(
    this.selectedFile,
    (progress: number) => {
      this.uploadProgress = progress;
    }
  );

  if (this.uploadProgress === 100) {
    setTimeout(() => {
      this.dialogRef.close(true);
    }, 500);
  }
}

}