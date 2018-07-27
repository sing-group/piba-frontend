import { Component, OnInit } from '@angular/core';
import { ClrDatagridComparatorInterface } from "@clr/angular";
import { ExplorationsService } from '../../services/explorations.service';
import Exploration from '../../models/Exploration';

@Component({
  selector: 'app-explorations',
  templateUrl: './explorations.component.html',
  styleUrls: ['./explorations.component.css']
})
export class ExplorationsComponent implements OnInit {

  explorations: Exploration[];

  editingExploration: Boolean;
  creatingExploration: Boolean;
  date: string;
  location: string;
  newExploration: Exploration;
  exploration: Exploration = new Exploration();

  constructor(private explorationsService: ExplorationsService) { }

  ngOnInit() {
    this.explorationsService.getExplorations().subscribe(explorations => this.explorations = explorations);
  }

  openModal(id: string) {
    if (id == null) {
      this.editingExploration = false;
      this.creatingExploration = true;
    } else {
      this.exploration =  this.explorations.find((exploration) => exploration.id == id);
      this.date = new Date(this.exploration.date).toLocaleDateString();
      this.location = this.exploration.location;
      this.editingExploration = true;
      this.creatingExploration = false;
    }
  }

  cancelModal() {
    this.date = null;
    this.location = null;
    this.creatingExploration = false;
    this.editingExploration = false;
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
    } else {
      this.exploration.location = this.location;
      this.exploration.date = new Date(this.date);
      this.explorationsService.editExploration(this.exploration).subscribe(updatedExploration => {
          Object.assign(this.explorations.find((exploration) => exploration.id == this.exploration.id), updatedExploration);
        });
    }
    this.cancelModal();
  }

}

class ExplorationComparator implements ClrDatagridComparatorInterface<Exploration>{
  compare(exploration1: Exploration, exploration2: Exploration) {
    return new Date(exploration1.date).getTime() - new Date(exploration2.date).getTime();
  }
}