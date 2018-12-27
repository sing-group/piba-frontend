import {Component, OnInit} from '@angular/core';
import {Gallery} from '../../models/Gallery';
import {GalleriesService} from '../../services/galleries.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  gallery: Gallery = new Gallery();


  constructor(private route: ActivatedRoute,
              private galleryService: GalleriesService) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.galleryService.getGallery(id).subscribe(gallery => {
      this.gallery = gallery;
      this.gallery.images.forEach(image => {
          image.gallery = this.gallery;
        }
      );
    });
  }

}
