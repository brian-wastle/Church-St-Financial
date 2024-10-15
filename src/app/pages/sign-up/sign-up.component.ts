import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { CognitoService } from '../../services/cognito/cognito.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    StepsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    PasswordModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})

export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  verificationForm: FormGroup;
  activeStep: number = 0;
  steps: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private cognitoService: CognitoService,
    private router: Router
  ) {
    this.signUpForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      givenName: ['', Validators.required],
      familyName: ['', Validators.required],
      birthdate: ['', Validators.required],
      address: ['', Validators.required]
    });

    // Initialize the verification form
    this.verificationForm = this.formBuilder.group({
      verificationCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.steps = [
      { label: 'Sign Up' },
      { label: 'Verify Code' }
    ];
  }

  signUp(): void {
    if (this.signUpForm.invalid) {
      return;
    }

    const { email, givenName, familyName, birthdate, address, phone_number, password } = this.signUpForm.value;

    this.loading = true;
    this.errorMessage = null;

    let formattedPhoneNumber: string | undefined = undefined;

    if (phone_number) {
      const phoneNumberWithCountryCode = phone_number.startsWith('+') ? phone_number : `+1${phone_number}`;
      const phoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);
      
      if (phoneNumber && phoneNumber.isValid()) {
        formattedPhoneNumber = phoneNumber.format('E.164');
      } else {
        this.errorMessage = 'Invalid phone number';
        this.loading = false;
        return;
      }
    }

    this.cognitoService.signUp(
      email,
      password,
      givenName,
      familyName,
      birthdate,
      address,
      formattedPhoneNumber || ""
    )
    .then(() => {
      this.loading = false;
      this.activeStep = 1; // Move to the next step
    })
    .catch((err) => {
      this.loading = false;
      this.errorMessage = err.message;
    });
  }

  verifyCode(): void {
    console.log('Form Valid:', this.verificationForm.valid);
    console.log('Verification Code:', this.verificationForm.value.verificationCode);

    if (this.verificationForm.invalid) {
      console.log('Verification form is invalid');
      return;
    }

    const { verificationCode } = this.verificationForm.value;
    const { email, password } = this.signUpForm.value;

    this.loading = true;
    this.errorMessage = null;

    // Use the updated verifyUser method from the CognitoService to handle verification and login
    this.cognitoService.verifyUser(verificationCode, email, password)
      .then(() => {
        console.log('Verification and login successful');
        this.router.navigate(['/']); // Redirect after successful verification and login
      })
      .catch((err) => {
        console.error('Verification or login failed:', err);
        this.errorMessage = 'Verification or login failed: ' + err.message;
        this.loading = false;
      });
  }
}