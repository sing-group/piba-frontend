/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Video} from '../../models/Video';
import {Exploration} from '../../models/Exploration';
import {VideoUploadInfo} from '../../services/entities/VideoUploadInfo';
import {VideosService} from '../../services/videos.service';
import {ExplorationsService} from '../../services/explorations.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Subscription} from 'rxjs';
import {PolypsService} from '../../services/polyps.service';
import {Polyp} from '../../models/Polyp';
import {VideoModificationsService} from '../../services/video-modifications.service';
import {VideoModification} from '../../models/VideoModification';
import {Role} from '../../models/User';
import {AuthenticationService} from '../../services/authentication.service';
import {PolypRecordingsService} from '../../services/polyprecordings.service';

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})
export class ExplorationComponent implements OnInit, OnDestroy {

  exploration: Exploration = null;
  video: Video = new Video();

  explorationConfirmationModalOpened = false;
  polypsConfirmationModalOpened = false;

  isVideoReadonly = true;
  editingVideo: string = null;
  deletingVideo = false;

  videoClones: Video[] = [];

  // Upload progress attributes
  uploadVideoModalOpened = false;
  videoUploaded = false;

  uploadingVideo = false;
  uploadProgress = 0;
  uploadTimeRemaining = 0;
  uploadSpeed = 0;

  // Internal attributes
  private readonly POLLING_INTERVAL: number = 5000;
  private pollings: Subscription[] = [];

  // to check if the title is used in the edition
  private videoTitle: String;

  private videoModificationsInExploration: VideoModification[] = [];

  constructor(
    private videosService: VideosService,
    private explorationsService: ExplorationsService,
    private polypsService: PolypsService,
    private polypRecordingsService: PolypRecordingsService,
    private videoModificationsService: VideoModificationsService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private readonly authenticationService: AuthenticationService
  ) {
  }

  private static mapVideo(video: Video): VideoUploadInfo {
    if (video.observations === undefined) {
      video.observations = '';
    }
    return {
      title: video.title,
      observations: video.observations,
      file: null,
      withText: String(video.withText),
      exploration: typeof video.exploration === 'string' ? video.exploration : video.exploration.id
    };
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.explorationsService.getExploration(id).subscribe(exploration => {
      this.exploration = exploration;
      this.assignVideoName();
      exploration.videos.filter((video) => video.isProcessing).forEach((processingVideo) => {
        this.pollProcessingVideo(processingVideo);
      });
      exploration.videos.forEach((video) => {
        this.videoClones.push({...video});
        this.videoModificationsService.listVideoModifications(video.id).subscribe(modifications => {
          this.videoModificationsInExploration = this.videoModificationsInExploration.concat(modifications);
          video.modifications = modifications;
          this.videoClones.find(clone => clone.id === video.id).modifications = modifications.map(m => ({...m}));
        });
        this.polypRecordingsService.getPolypRecordingsByVideo(video.id).subscribe(polypRecordings => {
          video.polypRecording = polypRecordings;
          this.videoClones.find(clone => clone.id === video.id).polypRecording = polypRecordings.map(pr => ({...pr}));
        });
      });
      this.exploration.polyps.forEach((polyp) => {
        polyp.exploration = exploration;
      });
    });
  }

  ngOnDestroy() {
    this.pollings.forEach((polling) => {
      polling.unsubscribe();
    });
  }

  private pollProcessingVideo(processingVideo: Video) {
    const videoPolling = this.videosService.getVideo(processingVideo.id, this.POLLING_INTERVAL).subscribe((video) => {
      this.updateVideo(this.exploration.videos, video);
      this.updateVideo(this.videoClones, video);
      if (!video.isProcessing) {
        videoPolling.unsubscribe();
        this.pollings.splice(this.pollings.indexOf(videoPolling, 0), 1);
      }
    });
    this.pollings.push(videoPolling);
  }

  private updateVideo(list: Video[], video: Video) {
    list.filter((currentVideo) => currentVideo.id === video.id).forEach((currentVideo) => {
      Object.assign(currentVideo, video);
    });
  }

  uploadVideo() {
    if (this.exploration.confirmed) {
      throw Error('Videos can\'t be uploaded to confirmed explorations');
    }

    const fileElement = document.getElementById('video-form-file') as HTMLInputElement;
    const file = fileElement.files[0];
    this.video.exploration = this.exploration.id;
    const videoUploadInfo = ExplorationComponent.mapVideo(this.video);
    videoUploadInfo.file = file;
    let startTime = Date.now();

    this.videosService.createVideo(videoUploadInfo,
      () => {
        startTime = Date.now();
      },
      (loaded, total) => {
        if (total) {
          this.uploadProgress = Math.round(loaded / total * 100);
          const timeElapsed = Date.now() - startTime;
          const uploadSpeed = loaded / (timeElapsed / 1000);
          this.uploadTimeRemaining = Math.ceil(
            (total - loaded) / uploadSpeed
          );
          this.uploadSpeed = uploadSpeed / 1024 / 1024;
        }
      },
      () => {
        this.uploadProgress = 0;
        this.uploadingVideo = false;
      }
    ).subscribe(video => {
      this.exploration.videos.push(video);
      this.videoClones.push({...video});
      this.notificationService.success('Video is being processed.', 'Video uploaded');
      if (video.isProcessing) {
        this.pollProcessingVideo(video);
      }
      this.cancel();
    });
  }

  cancel() {
    this.uploadVideoModalOpened = false;
    this.video = new Video();
    this.deletingVideo = false;
    this.polypsConfirmationModalOpened = false;
    this.explorationConfirmationModalOpened = false;
    this.videoUploaded = false;
    this.assignVideoName();
  }

  selectedVideoToRemove(id: string) {
    this.deletingVideo = true;
    this.video = {...this.findIn(this.exploration.videos, id)};
  }

  delete(id: string) {
    this.videosService.delete(id).subscribe(() => {
        this.exploration.videos.splice(this.getIndexIn(this.exploration.videos, id), 1);
        this.videoClones.splice(this.getIndexIn(this.videoClones, id), 1);
        this.notificationService.success('Video removed successfully.', 'Video removed.');
        this.cancel();
      }
    );
  }

  private getIndexIn(list: Video[], id: string): number {
    return list.indexOf(
      this.findIn(list, id)
    );
  }

  private findIn(list: Video[], id: string): Video {
    return list.find((video) => video.id === id);
  }

  selectedVideoToEdit(video: Video) {
    if (this.editingVideo != null) {
      Object.assign(this.findIn(this.videoClones, this.editingVideo), this.findIn(this.exploration.videos, this.editingVideo));
    }
    this.editingVideo = video.id;
    this.videoTitle = video.title;
    this.isVideoReadonly = false;
  }

  editVideo(video: Video) {
    if (this.exploration.confirmed) {
      throw Error('Videos can\'t be edited on confirmed explorations');
    }

    this.videosService.editVideo(video).subscribe(updatedVideo => {
      this.editingVideo = null;
      this.isVideoReadonly = true;
      Object.assign(this.findIn(this.exploration.videos, video.id), updatedVideo);
      this.notificationService.success('Video edited successfully.', 'Video edited.');
    });
  }

  isTitleUsed(newVideo: Video): boolean {
    if (this.editingVideo != null) {
      return this.exploration.videos.find((video) => video.title === newVideo.title) !== undefined
        && newVideo.title !== this.videoTitle;
    } else {
      return this.exploration.videos.find((video) => video.title === newVideo.title) !== undefined;
    }
  }

  isVideoUploaded(): boolean {
    return this.videoUploaded;
  }

  private assignVideoName() {
    this.video.title = 'Video ' + (this.exploration.videos.length + 1);
  }

  areAllPolypsConfirmed(): boolean {
    return this.exploration.polyps.find(polyp => polyp.confirmed === false) === undefined;
  }

  isExplorationConfirmed(): boolean {
    return this.exploration.confirmed;
  }

  onConfirmExploration() {
    this.exploration.confirmed = true;
    this.explorationsService.editExploration(this.exploration).subscribe(updatedExploration => {
      this.explorationsService.getExploration(updatedExploration.id).subscribe(exploration => this.exploration = exploration);
      this.notificationService.success('Exploration edited successfully.', 'Exploration edited.');
      this.cancel();
    });
  }

  onConfirmPolyps() {
    const polypsToBeConfirmed: Polyp[] = [];
    this.exploration.polyps.filter(polyp => polyp.confirmed === false).forEach(
      unconfirmedPolyp => {
        const polypToBeConfirmed: Polyp = new Polyp();
        Object.assign(polypToBeConfirmed, unconfirmedPolyp);
        polypsToBeConfirmed.push(polypToBeConfirmed);
      });

    polypsToBeConfirmed.forEach(polyp => polyp.confirmed = true);

    this.polypsService.editPolyps(polypsToBeConfirmed).subscribe(updatedPolyps => {
      updatedPolyps.forEach(updatedPolyp => {
        Object.assign(this.exploration.polyps.find((polyp) => {
            return polyp.id === updatedPolyp.id;
          }
        ), updatedPolyp);
        this.notificationService.success('All polyps were confirmed successfully', 'Polyps confirmed');
        this.cancel();
      });
    });

  }

  isEndoscopist(): boolean {
    return this.authenticationService.getRole() === Role.ENDOSCOPIST;
  }

  hasConfirmedElements(video: Video): boolean {
    return video.polypRecording.some(pr => pr.confirmed) || video.modifications.some(m => m.confirmed);
  }

  getVideoDeletionMessage() {
    const locationsCount = this.video.polypRecording.length;
    const modificationsCount = this.video.modifications.length;
    const polypsCount = new Set(this.video.polypRecording.map(pr => pr.polyp.id)).size; // Counts unique

    return `Are you sure you want to delete the video <strong>${this.video.title}</strong>? This video has <strong>${polypsCount} polyps ` +
        `</strong> located in <strong>${locationsCount} segments</strong> and <strong>${modificationsCount} zones annotated with ` +
        'modifications</strong>.' +
        '<div class="warning">This action is permanent and cannot be undone.</div>';
  }
}
