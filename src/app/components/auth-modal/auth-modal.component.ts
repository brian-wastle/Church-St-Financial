import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CognitoService } from '../../services/cognito/cognito.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  imports: [CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  standalone: true
})
export class AuthModalComponent implements OnInit{
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
    this.cognitoService.loadUserFromLocalStorage();
  }

  ngOnInit(): void {
    
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
