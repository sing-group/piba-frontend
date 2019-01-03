import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Image} from '../../models/Image';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {PolypLocation} from '../../models/PolypLocation';
import {ImagesService} from '../../services/images.service';
import {NotificationService} from '../../modules/notification/services/notification.service';

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

  constructor(private route: ActivatedRoute,
              private galleriesService: GalleriesService,
              private imagesService: ImagesService,
              private notificationService: NotificationService) {
    this.imageElement = document.createElement('img');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');


    // get gallery with images
    this.galleriesService.getGalleryForImage(id).subscribe(gallery => {
      this.gallery = gallery;
      // assign the gallery to the images
      this.gallery.images.forEach(image => {
          image.gallery = this.gallery;
        }
      );
      this.images = this.gallery.images;

      this.image = this.gallery.images.filter(image => {
          return image.id === id;
        }
      )[0];

      this.imageElement.src = 'data:image/png;base64,' + this.image.base64contents;

      // force a width, comment this two lines for use original image size
      /*this.imageElement.width='500';
      this.imageElement.height='500';*/
      this.canvas.width = this.imageElement.width;
      this.canvas.height = this.imageElement.height;
      this.repaint();
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
        this.ctx.beginPath();
        this.width = mousex - this.last_mousex;
        this.height = mousey - this.last_mousey;
        this.draw();
      }
    });
  }

  private draw() {
    // left, top, width, height
    this.ctx.rect(this.last_mousex, this.last_mousey, this.width, this.height);
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
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
    });
  }

  clear() {
    this.repaint();
    this.reset();
  }

  private repaint() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
    this.ctx.drawImage(this.imageElement, 0, 0, this.imageElement.width, this.imageElement.height);
  }

  private reset() {
    this.last_mousex = null;
    this.last_mousey = null;
    this.width = null;
    this.height = null;
  }

}
