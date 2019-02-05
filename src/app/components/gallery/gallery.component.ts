import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {Gallery} from '../../models/Gallery';
import {GalleriesService} from '../../services/galleries.service';
import {ActivatedRoute} from '@angular/router';
import {PolypLocation} from '../../models/PolypLocation';
import {ImagesService} from '../../services/images.service';
import {Image} from '../../models/Image';
import {ClrDatagridStateInterface} from '@clr/angular';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, AfterViewChecked {

  gallery: Gallery = new Gallery();
  images: Image[] = [];
  pageSize = 12;
  page: number;
  totalImages = -1;
  filter = 'all';

  private viewChecked = false;

  constructor(private route: ActivatedRoute,
              private galleryService: GalleriesService,
              private imageService: ImagesService) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.page = Number(this.route.snapshot.queryParamMap.get('page'));
    if (this.page === 0) {
      this.page = 1;
    }
    this.galleryService.getGallery(id).subscribe(gallery => {
      this.gallery = gallery;
      this.getImages();
    });
  }

  refreshPage(state: ClrDatagridStateInterface) {
    this.images = [];
    if (state.page !== undefined) {
      this.page = (state.page.from / state.page.size) + 1;
      if (this.gallery.id !== undefined) {
        this.getImages();
      }
    }
  }

  filterChange() {
    this.page = 1;
    this.images = [];
    this.getImages();
  }

  private getImages() {
    this.imageService.getImagesByGallery(this.gallery, this.page, this.pageSize, this.filter).subscribe(imagePage => {
      this.images = imagePage.images;
      this.totalImages = imagePage.totalItems;
      this.viewChecked = false;
    });
  }

  ngAfterViewChecked() {
    if (this.images.length > 0 && !this.viewChecked) {
      this.images.forEach(image => {
          const canvas: HTMLCanvasElement = document.getElementById('canvas-' + image.id) as HTMLCanvasElement;
          this.drawCanvasWithImage(canvas, image);
        }
      );
      this.viewChecked = true;
    }
  }

  private drawCanvasWithImage(canvas: HTMLCanvasElement, image: Image) {
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
        this.drawPolypLocation(ctx, image.polypLocation);
      }

    };
    imageElement.src = 'data:image/png;base64,' + image.base64contents;
  }


  private drawPolypLocation(ctx: CanvasRenderingContext2D, polypLocation: PolypLocation) {
    ctx.beginPath();
    // left, top, width, height
    ctx.rect(polypLocation.x, polypLocation.y, polypLocation.width, polypLocation.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

}
