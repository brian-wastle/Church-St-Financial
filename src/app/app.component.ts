import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Amplify } from 'aws-amplify';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AmplifyAuthenticatorModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Church-St-Financial';
  constructor(public authenticator: AuthenticatorService) {

  }
}
