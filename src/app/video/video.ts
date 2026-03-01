import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private firestore: Firestore, private storage: Storage) {}

  getVideos(): Observable<any[]> {
    const videoRef = collection(this.firestore, 'videos');
    return collectionData(videoRef, { idField: 'id' });
  }

  addVideo(data: any) {
    const videoRef = collection(this.firestore, 'videos');
    return addDoc(videoRef, data);
  }

  deleteVideo(id: string) {
    const docRef = doc(this.firestore, `videos/${id}`);
    return deleteDoc(docRef);
  }

  updateVisibility(id: string, visible: boolean) {
    const docRef = doc(this.firestore, `videos/${id}`);
    return updateDoc(docRef, { visible });
  }
  
  updateVideo(id: string, data: any) {
  const docRef = doc(this.firestore, `videos/${id}`);
  return updateDoc(docRef, data);
}

  async uploadVideo(file: File, progressCallback: (progress: number) => void) {

  const storageRef = ref(this.storage, `videos/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressCallback(Math.round(progress));
      },
      (error) => reject(error),
      async () => {

        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        await addDoc(collection(this.firestore, 'videos'), {
          title: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          status: 'Converted',
          uploadedDate: new Date().toISOString().split('T')[0],
          visible: true,
          duration: '00:00',
          videoUrl: downloadURL
        });

        resolve(true);
      }
    );
  });
}

}