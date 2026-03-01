import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService } from '../video';
import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import {MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, AgGridModule, MatDialogModule, MatDatepickerModule, MatInputModule, MatNativeDateModule, FormsModule,MatSlideToggleModule],
  templateUrl: './video-list.html',
  styleUrls: ['./video-list.css']
})
export class VideoListComponent implements OnInit {

  rowData: any[] = [];
  gridApi: any;
  rowSelection: 'multiple' | 'single' = 'multiple';
  selectedRows: any[] = [];
  selectedDate: any;
  originalData: any[] = [];

  openEditDialog(data: any) {
  this.dialog.open(UploadDialogComponent, {
    width: '500px',
    data: data
  });
}
onSearch(event: any) {
  const value = event.target.value;
  this.gridApi.setGridOption('quickFilterText', value);
}

onGridReady(params: any) {
  this.gridApi = params.api;
}

exportData() {
  this.gridApi.exportDataAsCsv();
}

onSelectionChanged() {
  this.selectedRows = this.gridApi.getSelectedRows();
}

async deleteSelected() {
  for (let row of this.selectedRows) {
    await this.videoService.deleteVideo(row.id);
  }
}

async makeAllVisible() {
  this.gridApi.forEachNode(async (node: any) => {
    await this.videoService.updateVisibility(node.data.id, true);
  });
}

onVisibilityFilter(event: any) {
  const value = event.target.value;

  if (!value) {
    this.rowData = this.originalData;
    return;
  }

  const isVisible = value === 'visible';

  this.rowData = this.originalData.filter(item =>
    item.visible === isVisible
  );
}

onDateFilter() {

  if (!this.selectedDate) {
    this.rowData = this.originalData;
    return;
  }

  const selected = new Date(this.selectedDate).toDateString();

  this.rowData = this.originalData.filter(item => {
    const itemDate = new Date(item.uploadedDate).toDateString();
    return itemDate === selected;
  });
}

onQuickDateFilter(event: any) {

  const value = event.target.value;

  if (!value) {
    this.rowData = this.originalData;
    return;
  }

  const today = new Date();
  let startDate = new Date();

  if (value === 'month') {
    startDate.setMonth(today.getMonth() - 1);
  }

  if (value === 'year') {
    startDate.setFullYear(today.getFullYear() - 1);
  }

  this.rowData = this.originalData.filter(item => {
    const itemDate = new Date(item.uploadedDate);
    return itemDate >= startDate;
  });

  if (this.rowData.length === 0) {
    this.rowData = [];
  }
}

  columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50
    },
    {
      field: 'title',
      headerName: 'About Video',
      cellRenderer: (params: any) => {

        const link = document.createElement('a');
        link.innerText = params.value;
        link.style.color = '#1976d2';
        link.style.cursor = 'pointer';
        link.style.fontWeight = '500';
        link.style.textDecoration = 'none';

        link.addEventListener('click', () => {
          this.router.navigate(['/video', params.data.id]);
        });

        return link;
      }
    },
    { field: 'size', filter: true },
    { field: 'status', filter: true },
    { field: 'uploadedDate' },
    {
      field: 'visible',
      headerName: 'Status',
      cellRenderer: (params: any) => {

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '8px';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = params.value;

        toggle.style.width = '40px';
        toggle.style.height = '18px';

        const label = document.createElement('span');
        label.innerText = params.value ? 'Visible' : 'Hidden';
        label.style.fontWeight = '500';

        toggle.addEventListener('change', () => {
          const newValue = toggle.checked;
          label.innerText = newValue ? 'Visible' : 'Hidden';
          this.videoService.updateVisibility(params.data.id, newValue);
        });

        container.appendChild(toggle);
        container.appendChild(label);

        return container;
      }
    },
    {
    headerName: 'Delete',
    cellRenderer: (params: any) => {
      const btn = document.createElement('button');
      btn.innerHTML = '<span class="material-icons" style="color:red;">delete</span>';
      btn.style.cursor = 'pointer';
      btn.style.border = 'none';
      btn.style.background = 'transparent';

      btn.addEventListener('click', () => {
        this.videoService.deleteVideo(params.data.id);
      });

      return btn;
    }
    },
    {
      headerName: 'Edit',
      cellRenderer: (params: any) => {
        const btn = document.createElement('button');
        btn.innerHTML = '<span class="material-icons" style="color:#1976d2;">edit</span>';
        btn.style.cursor = 'pointer';
        btn.style.border = 'none';
        btn.style.background = 'transparent';

        btn.addEventListener('click', () => {
          this.openEditDialog(params.data);
        });

        return btn;
      }
    },
    {
      headerName: 'Converted',
      cellRenderer: () => {
        const tick = document.createElement('span');
        tick.className = 'material-icons';
        tick.innerText = 'check_circle';
        tick.style.color = 'green';
        return tick;
      }
    }
  ];

  constructor(private videoService: VideoService,  
  private dialog: MatDialog,
  private router: Router
) {}

ngOnInit(): void {
  this.videoService.getVideos().subscribe(data => {
    this.originalData = data;
    this.rowData = data;
  });
}

openUpload() {
  this.dialog.open(UploadDialogComponent, {
    width: '500px'
  });
}
}