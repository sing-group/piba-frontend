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
  
  private explorationComparator = new ExplorationComparator();

  constructor(private explorationsService: ExplorationsService) { }

  ngOnInit() {
    this.explorationsService.getExplorations().subscribe(explorations => this.explorations = explorations);
  }

}

class ExplorationComparator implements ClrDatagridComparatorInterface<Exploration>{
  compare(exploration1: Exploration, exploration2: Exploration) {
    return new Date(exploration1.date).getTime() - new Date(exploration2.date).getTime();
  }
}
