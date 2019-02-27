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
import {AuthenticationService} from '../../services/authentication.service';
import {Role} from '../../models/User';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit {

  image: Image = new Image();
  previousImage: Image = new Image();
  followingImage: Image = new Image();
  imageElement: HTMLImageElement;
  identifiers: string[] = [];
  isFirstImage = false;
  isLastImage = false;
  isLoading = false;

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
  warningMessageWithoutSavingLocation = false;
  warningMessageRemovingLocation = false;
  selectedToRight = true;
  options = ['Not polyp', 'Bad quality', 'Others'];
  selected: string;
  observationToRemove = null;

  polypRecording: PolypRecording;
  type: string;
  dysplasingGrade: string;
  role = Role;

  filter: string;

  constructor(private route: ActivatedRoute,
              private galleriesService: GalleriesService,
              private imagesService: ImagesService,
              private notificationService: NotificationService,
              private location: Location,
              private router: Router,
              private polypRecordingService: PolypRecordingsService,
              public authenticationService: AuthenticationService) {
    this.imageElement = document.createElement('img');
    // Needed for Chrome
    document.body.appendChild(this.imageElement);
    this.imageElement.classList.toggle('hidden-element');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const gallery_id = this.route.snapshot.paramMap.get('gallery_id');
    this.filter = this.route.snapshot.queryParamMap.get('filter');

    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');

    this.galleriesService.getGallery(gallery_id).subscribe(gallery => {
      this.gallery = gallery;
      this.isLoading = true;
      this.imagesService.getImagesIdentifiersByGallery(gallery, this.filter).subscribe(identifiers => {
        this.isLoading = false;
          this.identifiers = identifiers;
          const index = this.identifiers.indexOf(
            this.identifiers.find(
              identifier =>
                identifier === id
            ));
          if (index === 0) {
            this.isFirstImage = true;
          }
          if (index === this.lastValidPosition()) {
            this.isLastImage = true;
          }
          this.loadAsPreviousImage(this.identifiers[index - 1]);
          this.loadAsFollowingImage(this.identifiers[index + 1]);
          this.getImageAndLoad(id);
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
        this.repaintImage();
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
    this.isLoading = true;
    this.imagesService.createLocation(this.image.id, polypLocation).subscribe((location) => {
      this.isLoading = false;
      this.image.polypLocation = location;
      this.notificationService.success('Location of the polyp stored correctly', 'Location of the polyp stored');
      this.reset();
      this.checkIfIsLastImage();
      if (this.isLastImage) {
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
    this.isLoading = true;
    this.imagesService.delete(this.image.id, this.observationToRemove).subscribe(() => {
      this.isLoading = false;
      this.notificationService.success('Image removed successfully.', 'Image removed.');
      const position = this.getImagePositionInArray();
      this.identifiers.splice(position, 1);
      if (this.identifiers.length === 0) {
        this.notificationService.info('No images in this gallery', 'No images');
        this.redirectToGallery();
      } else {
        // there is only one image
        if (this.identifiers.length === 1) {
          this.followingImage === null ? this.image = this.previousImage : this.image = this.followingImage;
          this.followingImage = null;
          this.previousImage = null;
          this.isLastImage = true;
          this.isFirstImage = true;
        } else if (position === this.identifiers.length) {
          // if is the last image it have to go a back position
          this.image = this.previousImage;
          this.isLastImage = true;
          this.followingImage = null;
          this.loadAsPreviousImage(this.identifiers[position - 2]);
        } else {
          this.image = this.followingImage;
          if (this.identifiers[position + 1] === undefined) {
            this.isLastImage = true;
            this.followingImage = null;
          }
          this.loadAsFollowingImage(this.identifiers[position + 1]);
        }
        this.paintImageAndLocation();
        this.cancel();
      }
    });
  }

  removeLocationAndCleanCanvas() {
    this.deleteLocation(this.image.id);
    this.cleanCanvas();
  }

  private deleteLocation(id: string) {
    this.isLoading = true;
    this.imagesService.deleteLocation(id).subscribe(() => {
        this.isLoading = false;
        this.image.polypLocation = null;
        this.notificationService.success('The location of the polyp has been correctly removed ', 'Polyp location removed');
      }
    );
  }

  private getImageAndLoad(id: string) {
    this.isLoading = true;
    this.imagesService.getImage(id).subscribe(img => {
      this.isLoading = false;
      this.image = img;
      this.paintImageAndLocation();
      if (this.authenticationService.getRole() !== Role.ENDOSCOPIST) {
        this.getPolypRecordingInfo();
        
      }
    });
  }

  private paintImageAndLocation() {
    this.imageElement.onload = () => {
      this.canvas.width = this.imageElement.width;
      this.canvas.height = this.imageElement.height;
      this.repaintImage();
      this.paintLocationIfAvailable();
    };
    this.imageElement.src = 'data:image/png;base64,' + this.image.base64contents;
    this.changeURLToCurrentImage();
  }

  private changeURLToCurrentImage() {
    this.location.go('gallery/' + this.gallery.id + '/image/' + this.image.id + '?filter=' + this.filter);
  }

  private paintLocationIfAvailable() {
    if (this.image.polypLocation !== null) {
      this.paintLocation(this.image.polypLocation);
    } else {
      this.reset();
    }
  }

  private paintLocation(polypLocation: PolypLocation) {
    this.last_mousex = polypLocation.x;
    this.last_mousey = polypLocation.y;
    this.width = polypLocation.width;
    this.height = polypLocation.height;
    this.draw();
  }

  private loadAsFollowingImage(id: string) {
    if (!this.isLastImage) {
      this.isLoading = true;
      this.imagesService.getImage(id).subscribe(image => {
          this.isLoading = false;
          this.followingImage = image;          
        }
      );
    }
  }

  private loadAsPreviousImage(id: string) {
    if (!this.isFirstImage) {
      this.isLoading = true;
      this.imagesService.getImage(id).subscribe(image => {
          this.isLoading = false;
          this.previousImage = image;          
        }
      );
    }
  }

  getImagePositionInArray(): number {
    return this.identifiers.indexOf(
      this.identifiers.find(
        id =>
          id === this.image.id
      ));
  }

  checkIfLocationSavedAndScrollImage() {
    const locationSaved = this.image.polypLocation;
    // if polyp is selected
    if (this.authenticationService.getRole() === this.role.ENDOSCOPIST && (this.last_mousex != null || this.last_mousey != null ||
      this.width != null || this.height != null)) {
      // if polyp wasn't saved
      if (locationSaved == null || (this.last_mousex !== locationSaved.x || this.last_mousey !== locationSaved.y ||
        this.width !== locationSaved.width || this.height !== locationSaved.height)) {
        this.warningMessageWithoutSavingLocation = true;
        return;
      }
    }
    this.toLeftOrToRight();
  }

  toLeftOrToRight() {
    this.selectedToRight === true ? this.toRight() : this.toLeft();
  }

  protected toLeft() {
    const position = this.getImagePositionInArray();
    this.followingImage = this.image;
    this.image = this.previousImage;
    this.actionsToScroll();
    this.loadAsPreviousImage(this.identifiers[position - 2]);
  }

  protected toRight() {
    const position = this.getImagePositionInArray();
    this.previousImage = this.image;
    this.image = this.followingImage;
    this.actionsToScroll();
    this.loadAsFollowingImage(this.identifiers[position + 2]);
  }

  private actionsToScroll() {
    this.paintImageAndLocation();
    this.checkIfIsFirstImage();
    this.checkIfIsLastImage();
  }

  private checkIfIsFirstImage() {
    this.getImagePositionInArray() <= 0 ? this.isFirstImage = true : this.isFirstImage = false;
  }

  private checkIfIsLastImage() {
    this.getImagePositionInArray() >= this.lastValidPosition() ? this.isLastImage = true : this.isLastImage = false;
  }

  cleanCanvas() {
    this.repaintImage();
    this.reset();
  }

  redirectToGallery() {
    let page = Math.trunc(this.getImagePositionInArray() * (this.lastValidPosition() / 12) / this.lastValidPosition()) + 1;
    if (isNaN(page)) {
      page = 1;
    }
    this.router.navigateByUrl('gallery/' + this.gallery.id + '?page=' + page);
  }

  private lastValidPosition(): number {
    return this.identifiers.length - 1;
  }

  cancel() {
    this.deleting = false;
    this.definingDeletion = false;
    this.selected = null;
    this.observationToRemove = null;
  }


  private repaintImage() {
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

  private getPolypRecordingInfo() {
    this.isLoading = true;
    this.polypRecordingService.getPolypRecordingsByVideo(this.image.video.id).subscribe(polypRecordings => {
      this.isLoading = false;
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
