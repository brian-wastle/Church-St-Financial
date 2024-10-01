import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CognitoService } from '../../services/cognito/cognito.service';

@Component({
  selector: 'auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true
})
export class AuthModalComponent {
  modalState: boolean = false;
  authForm: FormGroup;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder, public cognitoService: CognitoService) {
    this.authForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberDevice: [false] 
    });
  }

  login(): void {
    if (this.authForm.invalid) {
      return;
    }

    const { username, password, rememberDevice } = this.authForm.value;
    this.loading = true;
    this.errorMessage = null;

    this.cognitoService.signIn(username, password, rememberDevice).then(() => {
      this.loading = false; 
      this.closeModal(); 
    }).catch((err: any) => {
      this.loading = false;
      this.errorMessage = err.message;
    });
  }

  closeModal(): void {
    this.modalState = false;
  }
}
