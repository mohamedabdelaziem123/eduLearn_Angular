import { Component, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterViewInit {

  // Use inject() for ALL dependencies — consistent with field-injected PLATFORM_ID
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Build form with inject()-resolved FormBuilder
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
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

    this.authService.login(this.form.value).subscribe({
      next: (_res) => {
        this.isLoading = false;
        const role = this.authService.getRole();
        console.log(`Logged in as role: "${role}"`);
        this.router.navigate(['/dashboard/students']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ?? err?.message ?? 'Login failed. Please try again.';
      },
    });
  }
}
