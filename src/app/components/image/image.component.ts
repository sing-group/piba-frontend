import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Image} from '../../models/Image';
import {GalleriesService} from '../../services/galleries.service';
import {Gallery} from '../../models/Gallery';
import {PolypLocation} from '../../models/PolypLocation';
import {ImagesService} from '../../services/images.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {Location} from '@angular/common';

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
  options = ['Not polyp', 'Bad quality', 'Others'];
  selected: string;
  observationToRemove: string = null;

  constructor(private route: ActivatedRoute,
              private galleriesService: GalleriesService,
              private imagesService: ImagesService,
              private notificationService: NotificationService,
              private location: Location,
              private router: Router) {
    this.imageElement = document.createElement('img');
    // Needed for Chrome
    document.body.appendChild(this.imageElement);
    this.imageElement.classList.toggle('hidden-element');
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

      this.load();
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
      if (this.getPositionInArray() < this.images.length - 1) {
        this.move(+1);
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
      this.images.splice(this.getPositionInArray(), 1);
      if (this.images.length <= 0) {
        this.notificationService.info('No images in this gallery', 'No images');
        this.router.navigateByUrl('/gallery/' + this.gallery.id);
      } else if (this.getPositionInArray() < this.images.length - 1) {
        this.move(+1);
      }
      this.cancel();
    });
  }

  cancel() {
    this.deleting = false;
    this.definingDeletion = false;
    this.selected = null;
    this.observationToRemove = null;
  }

  getPositionInArray(): number {
    return this.images.indexOf(
      this.images.find(
        image =>
          image === this.image
      ));
  }

  move(position: number) {
    this.image = this.images[this.getPositionInArray() + position];
    this.load();
    this.location.go('/image/' + this.image.id);
  }

  clear() {
    this.repaint();
    this.reset();
  }

  back() {
    this.router.navigateByUrl('gallery/' + this.gallery.id);
  }

  deleteLocation(id: string) {
    this.imagesService.deleteLocation(id).subscribe(() => {
        this.image.polypLocation = null;
        this.notificationService.success('The location of the polyp has been correctly removed ', 'Polyp location removed');
      }
    );
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


}
