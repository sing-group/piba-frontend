import {Component, OnInit} from '@angular/core';
import {Gallery} from '../../models/Gallery';
import {GalleriesService} from '../../services/galleries.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Role} from '../../models/User';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-galleries',
  templateUrl: './galleries.component.html',
  styleUrls: ['./galleries.component.css']
})
export class GalleriesComponent implements OnInit {

  creatingGallery = false;
  editingGallery = false;
  gallery: Gallery = new Gallery();

  galleries: Gallery[] = [];
  role = Role;

  constructor(private galleriesService: GalleriesService,
              private notificationService: NotificationService,
              public authenticationService: AuthenticationService) {
    this.galleriesService.getGalleries().subscribe((galleries) => this.galleries = galleries);
  }

  ngOnInit() {
  }

  save() {
    if (this.creatingGallery) {
      this.galleriesService.createGallery(this.gallery).subscribe(
        (newGallery) => {
          this.galleries = this.galleries.concat(newGallery);
          this.notificationService.success('Gallery registered successfully.', 'Gallery registered.');
          this.cancel();
        });
    } else {
      this.galleriesService.editGallery(this.gallery).subscribe(updated => {
          Object.assign(this.galleries.find((gallery) => gallery.id === this.gallery.id), updated);
          this.notificationService.success('Gallery edited successfully.', 'Gallery edited.');
          this.cancel();
        }
      );
    }
  }

  edit(id: string) {
    this.editingGallery = true;
    this.gallery = new Gallery();
    Object.assign(this.gallery, this.galleries.find((gallery) => gallery.id === id));
  }

  cancel() {
    this.gallery = new Gallery();
    this.creatingGallery = false;
    this.editingGallery = false;
  }

}
