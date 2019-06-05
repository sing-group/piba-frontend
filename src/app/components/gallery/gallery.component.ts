import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
import {Gallery} from '../../models/Gallery';
import {GalleriesService} from '../../services/galleries.service';
import {ActivatedRoute} from '@angular/router';
import {PolypLocation} from '../../models/PolypLocation';
import {ImagesService} from '../../services/images.service';
import {Image} from '../../models/Image';
import {ClrDatagridPagination, ClrDatagridStateInterface} from '@clr/angular';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Location} from '@angular/common';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, AfterViewChecked {

  gallery: Gallery = new Gallery();
  pageChangeEvent = new Subject<string>();
  images: Image[] = [];
  pageSize = 12;
  pageLength = 0;
  totalImages = -1;
  filter = 'all';
  locatedImages: number;
  imagesWithPolyp: number;
  loading = false;
  showPolypLocation = true;

  @ViewChild(ClrDatagridPagination)
  pagination: ClrDatagridPagination;

  private viewChecked = false;

  constructor(private route: ActivatedRoute,
              private galleryService: GalleriesService,
              private imageService: ImagesService,
              private location: Location,
              private notificationService: NotificationService) {
  }

  ngOnInit() {
    // to wait when the user types the page to go
    this.pageChangeEvent.pipe(
      debounceTime(500),
      distinctUntilChanged()).subscribe(page => {
      if (Number(page) > 0 && Number(page) <= Math.ceil(this.totalImages / this.pageSize)) {
        this.pagination.page.current = Number(page);
      } else if (page.trim() !== '' && page.length >= this.pageLength) {
        this.notificationService.error('Invalid page entered.', 'Invalid page.');
      }
      this.pageLength = page.length;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (Number(this.route.snapshot.queryParamMap.get('page')) === 0) {
      this.pagination.page.current = 1;
    }
    this.galleryService.getGallery(id).subscribe(gallery => {
      this.gallery = gallery;
      this.getImages();
    });

    this.filter = this.route.snapshot.queryParamMap.get('filter') == null ? 'all' : this.route.snapshot.queryParamMap.get('filter');
    this.showPolypLocation = this.route.snapshot.queryParamMap.get('show_location') == null ? true :
      this.route.snapshot.queryParamMap.get('show_location') === 'true';
  }

  get page(): number {
    return this.pagination.page.current;
  }

  set page(pageNumber: number) {
    if (typeof pageNumber === 'number') {
      this.pagination.page.current = pageNumber;
    }
  }

  private changeURL() {
    this.location.go('gallery/' + this.gallery.id + '?page=' + this.page + '&filter=' + this.filter + '&show_location='
      + this.showPolypLocation);
  }

  refreshPage(state: ClrDatagridStateInterface) {
    this.images = [];
    if (state.page !== undefined) {
      this.pagination.page.current = (state.page.from / state.page.size) + 1;
      if (this.gallery.id !== undefined) {
        this.getImages();
      }
    }
  }

  filterChange() {
    const pageToGo = <HTMLInputElement>document.getElementById('page-to-go') as HTMLInputElement;
    if (pageToGo != null) {
      pageToGo.value = '1';
    }
    this.pagination.page.current = 1;
    this.images = [];
    this.getImages();
    this.changeURL();
  }

  private getImages() {
    this.loading = true;
    this.imageService.getImagesByGallery(this.gallery, this.pagination.page.current, this.pageSize, this.filter).subscribe(imagePage => {
      this.images = imagePage.images;
      this.totalImages = imagePage.totalItems;
      this.imagesWithPolyp = imagePage.imagesWithPolyp;
      this.locatedImages = imagePage.locatedImages;
      this.viewChecked = false;
      this.loading = false;
    });
  }

  loadImages() {
    if (this.images.length > 0) {
      this.images.forEach(image => {
          const canvas: HTMLCanvasElement = document.getElementById('canvas-' + image.id) as HTMLCanvasElement;
          this.drawCanvasWithImage(canvas, image);
        }
      );
    }
    this.changeURL();
  }

  ngAfterViewChecked() {
    if (!this.viewChecked) {
      this.loadImages();
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

      if (image.polypLocation !== null && this.showPolypLocation) {
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
