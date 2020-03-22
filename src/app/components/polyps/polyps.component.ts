import {Component, OnInit, ViewChild} from '@angular/core';
import {PolypsService} from '../../services/polyps.service';
import {ClrDatagridPagination, ClrDatagridStateInterface} from '@clr/angular';
import {Polyp} from '../../models/Polyp';
import {Subject} from 'rxjs/internal/Subject';
import {concatMap, debounceTime, distinctUntilChanged, map, tap} from 'rxjs/operators';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ExplorationsService} from '../../services/explorations.service';
import {PolypRecordingsService} from '../../services/polyprecordings.service';

@Component({
  selector: 'app-polyps',
  templateUrl: './polyps.component.html',
  styleUrls: ['./polyps.component.css']
})
export class PolypsComponent implements OnInit {
  // Data
  polyps: Polyp[] = [];

  // Status
  loading = false;

  // Pagination
  @ViewChild(ClrDatagridPagination)
  pagination: ClrDatagridPagination;
  paginationTotalItems = 0;
  pageSize = 15;
  pageChangeEvent = new Subject<string>();

  constructor(
    private readonly explorationsService: ExplorationsService,
    private readonly notificationService: NotificationService,
    private readonly polypsService: PolypsService,
    private readonly polypRecordingsService: PolypRecordingsService
  ) { }

  ngOnInit() {
    this.pageChangeEvent.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(page => {
      if (this.isValidPage(page)) {
        this.pagination.page.current = Number(page);
      } else {
        this.notificationService.error('Invalid page entered.', 'Invalid page.');
      }
    });

    this.pagination.page.current = 1;
    this.getPagePolyps();
  }

  private isValidPage(page: string): boolean {
    const pageNumber = Number(page);

    return !isNaN(pageNumber) && pageNumber > 0
      && pageNumber <= Math.ceil(this.paginationTotalItems / this.pageSize);
  }

  get currentPage(): number {
    return this.pagination.page.current;
  }

  set currentPage(page: number) {
    if (typeof page === 'number') {
      this.pagination.page.current = page;
    }
  }

  refreshPage(state: ClrDatagridStateInterface) {
    if (state.page !== undefined) {
      this.pagination.page.current = (state.page.from / state.page.size) + 1;
      this.getPagePolyps();
    }
  }

  private getPagePolyps() {
    this.loading = true;
    this.polypsService.getPolyps(this.currentPage, this.pageSize)
      .pipe(
        concatMap(polypPage => this.explorationsService.addExplorationsToPolyps(polypPage.polyps)
          .pipe(
            map(polyps => {
              polypPage.polyps = polyps;
              return polypPage;
            })
          )
        ),
        concatMap(polypPage => this.polypRecordingsService.addRecordingsToPolyps(polypPage.polyps)
          .pipe(
            map(polyps => {
              polypPage.polyps = polyps;
              return polypPage;
            })
          )
        )
      )
    .subscribe(polypsPage => {
      this.polyps = polypsPage.polyps;
      this.paginationTotalItems = polypsPage.totalItems;
      this.loading = false;
    });
  }

}
