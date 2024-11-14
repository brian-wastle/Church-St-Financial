import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CognitoService } from '../../services/cognito/cognito.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { effect } from '@angular/core';

@Component({
  selector: 'auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    MessageModule
  ],
  standalone: true
})
export class AuthModalComponent implements OnInit {
  authForm: FormGroup;
  loading: boolean = false;
  errorMessage: string | null = null;
  hasValidSession: boolean = false;  

  constructor(private formBuilder: FormBuilder, public cognitoService: CognitoService) {
    this.authForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberDevice: [false]
    });

    effect(() => {
      const currentUser = this.cognitoService.currentUserSignal();
      this.hasValidSession = !!currentUser && !!currentUser.idToken;
    });
  }

  ngOnInit(): void {}

  login(): void {
    if (this.authForm.invalid) {
      return;
    }

    const { username, password, rememberDevice } = this.authForm.value;
    this.loading = true;
    this.errorMessage = null;

    this.cognitoService.signIn(username, password, rememberDevice).then(() => {
      this.loading = false;
    }).catch((err: any) => {
      this.loading = false;
      this.errorMessage = err.message;
    });
  }
}
