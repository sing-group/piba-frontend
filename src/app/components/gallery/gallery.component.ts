import {Component, OnInit, ViewChild} from '@angular/core';
import {Gallery} from '../../models/Gallery';
import {GalleriesService} from '../../services/galleries.service';
import {ActivatedRoute} from '@angular/router';
import {PolypLocation} from '../../models/PolypLocation';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  gallery: Gallery = new Gallery();

  private viewChecked = false;

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

  ngAfterViewChecked() {

    if (this.gallery.images && !this.viewChecked) {

      this.gallery.images.forEach(image => {

          const canvas: HTMLCanvasElement = document.getElementById('canvas-' + image.id) as HTMLCanvasElement;
          const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
          const imageElement: HTMLImageElement = document.createElement('img');
          // Needed for Chrome
          document.body.appendChild(imageElement);
          imageElement.classList.toggle('hidden-element');

          imageElement.onload = () => {
            canvas.width = imageElement.width;
            canvas.height = imageElement.height;
            ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

            if (image.polypLocation !== null) {
              this.drawBox(ctx, image.polypLocation);
            }

          };
          imageElement.src = 'data:image/png;base64,' + image.base64contents;
        }
      );
      this.viewChecked = true;
    }
  }

  private drawBox(ctx: CanvasRenderingContext2D, polypLocation: PolypLocation) {
    ctx.beginPath();
    // left, top, width, height
    ctx.rect(polypLocation.x, polypLocation.y, polypLocation.width, polypLocation.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

}
