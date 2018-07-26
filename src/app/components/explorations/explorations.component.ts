import { Component, OnInit } from '@angular/core';
import { ClrDatagridComparatorInterface } from "@clr/angular";
import { ExplorationsService } from '../../services/explorations.service';
import Exploration from '../../models/Exploration';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-explorations',
  templateUrl: './explorations.component.html',
  styleUrls: ['./explorations.component.css']
})
export class ExplorationsComponent implements OnInit {

  explorations: Exploration[];

  showModal: Boolean = false;
  editingExploration: Boolean;

  date: Date;
  location: string;
  newExploration: Exploration;

  constructor(private explorationsService: ExplorationsService) { }

  ngOnInit() {
    this.explorationsService.getExplorations().subscribe(explorations => this.explorations = explorations);
  }

  openModal(id: string) {
    (id == null) ? this.editingExploration = false : this.editingExploration = true;
    this.showModal = true;
  }

  cancelModal() {
    this.showModal = false;
    this.date = null;
    this.location = null;
  }

  save() {
    if (!this.editingExploration) {
      this.newExploration = {
        id: null,
        date: new Date(this.date),
        location: this.location,
        videos: []
      }
      this.explorationsService.createExploration(this.newExploration)
        .subscribe(newExploration => this.explorations = this.explorations.concat(newExploration));
    }
    this.cancelModal();
  }

}

class ExplorationComparator implements ClrDatagridComparatorInterface<Exploration>{
  compare(exploration1: Exploration, exploration2: Exploration) {
    return new Date(exploration1.date).getTime() - new Date(exploration2.date).getTime();
  }
}
