import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-search-tips',
  standalone: true,
  imports: [CardModule, PanelModule],
  templateUrl: './search-tips.component.html',
  styleUrl: './search-tips.component.scss'
})
export class SearchTipsComponent {

}
