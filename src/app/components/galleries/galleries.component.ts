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

  galleries: Gallery[] = [];
  role = Role;

  constructor(private galleriesService: GalleriesService,
              private notificationService: NotificationService,
              public authenticationService: AuthenticationService) {
    this.galleriesService.getGalleries().subscribe((galleries) => this.galleries = galleries);
  }

  ngOnInit() {
  }

}
