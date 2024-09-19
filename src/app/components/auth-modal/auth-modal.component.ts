import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CognitoService } from '../../services/cognito/cognito.service';

@Component({
  selector: 'auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AuthModalComponent implements OnInit {
  authForm: FormGroup;
  isSignInMode: boolean = true;
  errorMessage: string | null = null;
  loading: boolean = false;
  loggedInSignal = signal(false); // Signal for login state

  constructor(private formBuilder: FormBuilder, private cognitoService: CognitoService) {
    this.authForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check initial login state from the CognitoService signal
    this.isSignInMode = !this.cognitoService.hasValidToken();
  }

  login(): void {
    if (this.authForm.invalid) {
      return;
    }
    const { username, password } = this.authForm.value;
    this.loading = true;
    this.errorMessage = null;
  
    this.cognitoService.signIn(username, password).then(() => {
      this.loading = false;
      this.loggedInSignal.set(true); 
      this.closeModal(); 
    }).catch((err: any) => {
      this.loading = false;
      this.errorMessage = err.message;
    });
  }

  logout(): void {
    this.cognitoService.signOut(); 
    this.loggedInSignal.set(false); 
    this.closeModal(); 
  }

  toggleMode(): void {
    this.isSignInMode = !this.isSignInMode;
    this.authForm.reset();
    this.errorMessage = null;
  }

  closeModal(): void {
    // Logic to close modal
  }
}
