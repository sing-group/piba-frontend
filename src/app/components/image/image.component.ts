import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Image} from '../../models/Image';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {PolypLocation} from '../../models/PolypLocation';
import {ImagesService} from '../../services/images.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Location} from '@angular/common';
import {PolypRecordingsService} from '../../services/polyprecordings.service';
import {PolypRecording} from '../../models/PolypRecording';
import {Adenoma, PolypType, SSA, TSA} from '../../models/PolypHistology';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit {

  image: Image = new Image();
  imageElement: HTMLImageElement;
  images: Image[] = [];

  private gallery: Gallery = new Gallery();

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mousedown: boolean;
  public last_mousex: number = null;
  public last_mousey: number = null;
  public width: number = null;
  public height: number = null;

  deleting = false;
  definingDeletion = false;
  options = ['Not polyp', 'Bad quality', 'Polyp error information', 'Others'];
  selected: string;
  observationToRemove: string = null;

  polypRecording: PolypRecording;
  type: string;
  dysplasingGrade: string;

  page: number;
  pageSize = 12;
  totalImages: number;
  numPages: number;

  constructor(private route: ActivatedRoute,
              private galleriesService: GalleriesService,
              private imagesService: ImagesService,
              private notificationService: NotificationService,
              private location: Location,
              private router: Router,
              private polypRecordingService: PolypRecordingsService) {
    this.imageElement = document.createElement('img');
    // Needed for Chrome
    document.body.appendChild(this.imageElement);
    this.imageElement.classList.toggle('hidden-element');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const gallery_id = this.route.snapshot.paramMap.get('gallery_id');
    this.page = Number(this.route.snapshot.queryParamMap.get('page'));

    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');

    this.galleriesService.getGallery(gallery_id).subscribe(gallery => {
      this.gallery = gallery;

      this.imagesService.getImagesByGallery(gallery, this.page, this.pageSize).subscribe(images => {
          this.images = images.images;
          this.totalImages = images.totalItems;
          this.numPages = this.totalImages / this.pageSize;
          this.image = this.images.filter(image => {
              return image.id === id;
            }
          )[0];
          this.load();
          this.getPolypRecordingInfo();
        }
      );
    });

    // Mouseup
    this.canvas.addEventListener('mouseup', () => {
      this.mousedown = false;
    });

    // Mousedown
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      const canvasx: number = this.canvas.offsetLeft;
      const canvasy: number = this.canvas.offsetTop;
      this.last_mousex = e.clientX - canvasx;
      this.last_mousey = e.clientY - canvasy;
      this.mousedown = true;
    });

    // Mousemove
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const canvasx: number = this.canvas.offsetLeft;
      const canvasy: number = this.canvas.offsetTop;

      const mousex = e.clientX - canvasx;
      const mousey = e.clientY - canvasy;

      if (this.mousedown) {
        this.repaint();
        this.width = mousex - this.last_mousex;
        this.height = mousey - this.last_mousey;
        this.draw();
      }
    });
  }

  save() {
    const polypLocation: PolypLocation = {
      x: this.last_mousex,
      y: this.last_mousey,
      width: this.width,
      height: this.height
    };
    this.imagesService.createLocation(this.image.id, polypLocation).subscribe((location) => {
      this.image.polypLocation = location;
      this.notificationService.success('Location of the polyp stored correctly', 'Location of the polyp stored');
      this.reset();
      if (this.getPositionInArray() === this.numberOfImages() && this.onLastPage()) {
        this.notificationService.info('There are no more images in this gallery', 'No images remain');
      } else {
        this.toRight();
      }
    });
  }

  delete() {
    this.deleting = false;
    this.definingDeletion = true;
  }

  remove() {
    if (this.selected !== 'Others') {
      this.observationToRemove = this.selected;
    }
    this.imagesService.delete(this.image.id, this.observationToRemove).subscribe(() => {
      this.notificationService.success('Image removed successfully.', 'Image removed.');
      if (this.images.length <= 0 && this.totalImages === 0) {
        this.notificationService.info('No images in this gallery', 'No images');
        this.redirectToGallery();
      } else {
        const lastPosition = this.getPositionInArray();
        const onLastImageOfPage = lastPosition === this.numberOfImages();
        this.getImagesAndReloadImage((onLastImageOfPage && this.onLastPage()) ? lastPosition - 1 : lastPosition);
      }
      this.images.splice(this.getPositionInArray(), 1);
      this.totalImages = this.totalImages - 1;
      this.cancel();
    });
  }

  deleteLocation(id: string) {
    this.imagesService.deleteLocation(id).subscribe(() => {
        this.image.polypLocation = null;
        this.notificationService.success('The location of the polyp has been correctly removed ', 'Polyp location removed');
      }
    );
  }

  getPositionInArray(): number {
    return this.images.indexOf(
      this.images.find(
        image =>
          image === this.image
      ));
  }

  toLeft() {
    if (this.getPositionInArray() <= 0 && this.page !== 1) {
      this.page = this.page - 1;
      this.getImagesAndReloadImage(this.numberOfImages());
    } else {
      this.reloadImage(this.getPositionInArray() - 1);
    }
    this.changeURL();
  }

  toRight() {
    if (this.getPositionInArray() >= this.numberOfImages() && this.page < this.numPages) {
      this.page = this.page + 1;
      this.getImagesAndReloadImage(0);
    } else {
      this.reloadImage(this.getPositionInArray() + 1);
    }
    this.changeURL();
  }

  clear() {
    this.repaint();
    this.reset();
  }

  redirectToGallery() {
    this.router.navigateByUrl('gallery/' + this.gallery.id + '?page=' + this.page);
  }

  cancel() {
    this.deleting = false;
    this.definingDeletion = false;
    this.selected = null;
    this.observationToRemove = null;
  }

  private changeURL() {
    this.location.go('gallery/' + this.gallery.id + '/image/' + this.image.id + '?page=' + this.page);
  }

  private onLastPage(): boolean {
    return this.page >= this.numPages;
  }

  private numberOfImages(): number {
    return this.images.length - 1;
  }

  private getImagesAndReloadImage(position: number) {
    this.imagesService.getImagesByGallery(this.gallery, this.page, this.pageSize).subscribe(images => {
        this.images = images.images;
        this.totalImages = images.totalItems;
        this.reloadImage(position);
      }
    );
  }

  private reloadImage(position: number) {
    this.image = this.images[position];
    this.load();
    this.getPolypRecordingInfo();
  }

  private load() {
    this.loadImage(() => {
      this.repaint();
      this.hasLocation();
    });
  }

  private loadImage(onLoad: () => void) {
    this.imageElement.onload = () => {
      this.canvas.width = this.imageElement.width;
      this.canvas.height = this.imageElement.height;
      onLoad();
    };
    this.imageElement.src = 'data:image/png;base64,' + this.image.base64contents;
  }

  private repaint() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
    this.ctx.drawImage(this.imageElement, 0, 0, this.imageElement.width, this.imageElement.height);
  }

  private draw() {
    this.ctx.beginPath();
    // left, top, width, height
    this.ctx.rect(this.last_mousex, this.last_mousey, this.width, this.height);
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private reset() {
    this.last_mousex = null;
    this.last_mousey = null;
    this.width = null;
    this.height = null;
  }

  private hasLocation() {
    if (this.image.polypLocation !== null) {
      this.restoreLocation(this.image.polypLocation);
    } else {
      this.reset();
    }
  }

  private restoreLocation(polypLocation: PolypLocation) {
    this.last_mousex = polypLocation.x;
    this.last_mousey = polypLocation.y;
    this.width = polypLocation.width;
    this.height = polypLocation.height;
    this.draw();
  }

  private getPolypRecordingInfo() {
    this.polypRecordingService.getPolypRecordingsByVideo(this.image.video.id).subscribe(polypRecordings => {
      for (const polypRecording of polypRecordings) {
        const frame = Math.floor(this.image.numFrame / this.image.video.fps - 1);
        if (frame >= polypRecording.start && frame <= polypRecording.end) {
          this.polypRecording = polypRecording;
          switch (polypRecording.polyp.histology.polypType) {
            case PolypType.ADENOMA:
              this.type = (<Adenoma>polypRecording.polyp.histology).type;
              this.dysplasingGrade = (<Adenoma>polypRecording.polyp.histology).dysplasingGrade;
              break;
            case PolypType.INVASIVE:
            case PolypType.HYPERPLASTIC:
            case PolypType.NON_EPITHELIAL_NEOPLASTIC:
              this.type = null;
              this.dysplasingGrade = null;
              break;
            case PolypType.SESSILE_SERRATED_ADENOMA:
              this.type = null;
              this.dysplasingGrade = (<SSA>polypRecording.polyp.histology).dysplasingGrade;
              break;
            case PolypType.TRADITIONAL_SERRATED_ADENOMA:
              this.type = null;
              this.dysplasingGrade = (<TSA>polypRecording.polyp.histology).dysplasingGrade;
              break;
            default:
              this.type = null;
              this.dysplasingGrade = null;
          }
        }
      }
    });
  }

}
