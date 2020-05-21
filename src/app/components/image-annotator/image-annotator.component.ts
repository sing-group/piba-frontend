import {ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';
import {PolypLocation} from '../../models/PolypLocation';

@Component({
  selector: 'app-image-annotator',
  templateUrl: './image-annotator.component.html',
  styleUrls: ['./image-annotator.component.css']
})
export class ImageAnnotatorComponent {
  private static readonly STROKE_SIZE = 2;

  @Input() src: string;
  @Input() disabled = false;

  @Output() polypLocationChange = new EventEmitter<PolypLocation>();

  @ViewChild('canvasElement') private canvasElementRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageElement') private imageElementRef: ElementRef<HTMLImageElement>;

  private _polypLocation: PolypLocation;
  private _showLocation = true;
  private newPolypLocation: PolypLocation = null;

  constructor(
    private readonly cdRef: ChangeDetectorRef
  ) { }

  @Input() set polypLocation(polypLocation: PolypLocation) {
    if (!PolypLocation.areEqual(this._polypLocation, polypLocation)) {
      this.clearLocation();
      this._polypLocation = polypLocation;
      this.paintLocation();
    }
  }

  get polypLocation(): PolypLocation {
    return this._polypLocation;
  }

  @Input() set showLocation(showLocation: boolean) {
    if (this._showLocation !== showLocation) {
      this._showLocation = showLocation;

      if (this._showLocation) {
        this.paintLocation();
      } else {
        this.clearLocation();
      }
    }
  }

  get showLocation(): boolean {
    return this._showLocation;
  }

  get canvasElement(): HTMLCanvasElement {
    return Boolean(this.canvasElementRef) ? this.canvasElementRef.nativeElement : null;
  }

  get imageElement(): HTMLImageElement {
    return this.imageElementRef.nativeElement;
  }

  get context2D(): CanvasRenderingContext2D {
    return this.canvasElement.getContext('2d');
  }

  get dataUrl(): string {
    return Boolean(this.canvasElement) ? this.canvasElement.toDataURL() : '#';
  }

  get polypLocationToPaint(): PolypLocation {
    return this.isDrawing ? this.newPolypLocation : this.polypLocation;
  }

  get isDrawing(): boolean {
    return this.newPolypLocation !== null;
  }

  private canLocate(): boolean {
    return !this.disabled;
  }

  private repaint(): void {
    this.paintImage();
    this.paintLocation();
  }

  private paintImage(): void {
    const context = this.context2D;

    context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    this.canvasElement.width = this.imageElement.width;
    this.canvasElement.height = this.imageElement.height;
    context.drawImage(this.imageElement, 0, 0, this.imageElement.width, this.imageElement.height);
  }

  private clearLocation(): void {
    let polypLocation = this.polypLocationToPaint;
    if (Boolean(polypLocation) && polypLocation.isValid()) {
      polypLocation = polypLocation.regularize();

      const context = this.context2D;

      const x = Math.max(0, polypLocation.x - ImageAnnotatorComponent.STROKE_SIZE);
      const y = Math.max(0, polypLocation.y - ImageAnnotatorComponent.STROKE_SIZE);
      const width = Math.min(this.canvasElement.width, polypLocation.width + ImageAnnotatorComponent.STROKE_SIZE * 2);
      const height = Math.min(this.canvasElement.height, polypLocation.height + ImageAnnotatorComponent.STROKE_SIZE * 2);

      context.drawImage(this.imageElement, x, y, width, height, x, y, width, height);
    }
  }

  private paintLocation(): void {
    const polypLocation = this.polypLocationToPaint;
    if (Boolean(polypLocation) && polypLocation.isValid()) {
      const context = this.context2D;

      context.beginPath();
      context.strokeStyle = 'red';
      context.lineWidth = ImageAnnotatorComponent.STROKE_SIZE;
      context.rect(polypLocation.x, polypLocation.y, polypLocation.width, polypLocation.height);
      context.stroke();
    }
  }

  private adjustMouseLocation(event: MouseEvent): {
    x: number, y: number
  } {
    const bounds = this.canvasElement.getBoundingClientRect();

    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    };
  }

  onImageLoad() {
    this.repaint();
  }

  onMouseDown(event: MouseEvent) {
    if (this.canLocate()) {
      const location = this.adjustMouseLocation(event);
      this.clearLocation();
      this.newPolypLocation = new PolypLocation(location.x, location.y, 0, 0);
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.canLocate() && this.isDrawing) {
      const location = this.adjustMouseLocation(event);

      this.clearLocation();

      this.newPolypLocation.width = location.x - this.newPolypLocation.x;
      this.newPolypLocation.height = location.y - this.newPolypLocation.y;

      this.paintLocation();
    }
  }

  // Global listener is used to detect mouse up outside the canvas
  @HostListener('window:mouseup')
  onMouseUp() {
    if (this.canLocate() && this.isDrawing) {
      this.polypLocation = this.newPolypLocation;
      this.newPolypLocation = null;
      this.repaint();
      this.polypLocationChange.emit(this.polypLocation);
    }
  }
}
