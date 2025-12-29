import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthServiceService } from '../services/auth-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../Models/api-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatInputModule, MatIconModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email!: string;
  password!: string;

  private authService = inject(AuthServiceService);
  private snakeBar = inject(MatSnackBar);
  private router = inject(Router);

  hide = signal(false);

  togglePassword(event:MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  login() {
    this.authService.login({email: this.email, password: this.password}).subscribe({
      next: () => {
        this.snakeBar.open('Login Successful', 'Close', {duration: 3000});
      },
      error: (error:HttpErrorResponse) => {
        let err= error.error as ApiResponse<string>;
        this.snakeBar.open(`Registration failed: ${err.error}`, 'Close', {duration: 3000});
      },
      complete: () => {
        this.router.navigate(['/']);
      }
    });
  }

}
