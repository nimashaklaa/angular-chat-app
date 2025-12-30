import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../Models/api-response';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/button/button.component';

@Component({
  selector: 'app-login',
  imports: [MatInputModule, MatIconModule, FormsModule, RouterLink, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email!: string;
  password!: string;

  authService = inject(AuthService);
  private snakeBar = inject(MatSnackBar);
  private router = inject(Router);

  hide = signal(false);

  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  login() {
    this.authService.isLoading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.authService.profile().subscribe();
        this.snakeBar.open('Login Successful', 'Close', { duration: 3000 });
        this.authService.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        let err = error.error as ApiResponse<string>;
        this.snakeBar.open(`Registration failed: ${err.error}`, 'Close', { duration: 3000 });
        this.authService.isLoading.set(false);
      },
      complete: () => {
        this.router.navigate(['/']);
        this.authService.isLoading.set(false);
      },
    });
  }
}
