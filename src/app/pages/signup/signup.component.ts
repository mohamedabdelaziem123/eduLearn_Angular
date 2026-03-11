import { Component, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, SignupPayload } from '../../services/auth.service';

/** Custom validator: at least 8 chars, one uppercase, one digit, one special char */
function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  const valid =
    val.length >= 8 &&
    /[A-Z]/.test(val) &&
    /[0-9]/.test(val) &&
    /[^A-Za-z0-9]/.test(val);
  return valid ? null : { weakPassword: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements AfterViewInit {

  // Use inject() for ALL dependencies — consistent + SSR-safe
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Form built as a field initializer using inject()-resolved FormBuilder
  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPasswordValidator]],
    address: ['', Validators.required],
    gender: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
  });

  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;  // Google SDK is browser-only
    this.authService.initGoogle(
      (credential: string) => this.authService.handleGoogleCredential(credential)
    );
  }

  get f() { return this.form.controls; }

  togglePassword(): void { this.showPassword = !this.showPassword; }
  signInWithGoogle(): void { this.authService.signInWithGoogle(); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const val = this.form.value;
    const payload: SignupPayload = {
      username: val.username,
      email: val.email,
      password: val.password,
      confirmpassword: val.password, // Backend requires this field, so we mirror password.
      address: val.address,
      gender: val.gender,
      phone: val.phone,
    };

    this.authService.signup(payload).subscribe({
      next: (_response) => {
        this.isLoading = false;
        this.successMessage = 'Account created! Redirecting to login…';
        setTimeout(() => this.router.navigate(['/login']), 500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ?? err?.message ?? 'Sign up failed. Please try again.';
      },
    });
  }
}
