import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccountInfoComponent } from '../account-info/account-info.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, ButtonModule, AccountInfoComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
}
