import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../Models/api-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email!: string;
  password!: string;
  fullName!: string;
  username!: string;
  profilePicture: string =
    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  profileImage: File | null = null;

  authService = inject(AuthService);
  snakeBar = inject(MatSnackBar);
  router = inject(Router);

  hide = signal(false);

  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.profileImage = file;

      const reader = new FileReader();
      reader.onload = e => {
        this.profilePicture = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      console.log(this.profileImage);
    }
  }
  register() {
    let formData = new FormData();
    formData.append('Email', this.email);
    formData.append('Password', this.password);
    formData.append('FullName', this.fullName);
    formData.append('UserName', this.username);
    if (this.profileImage) {
      formData.append('ProfileImage', this.profileImage);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.snakeBar.open('Registration successful:', 'Close');
      },
      error: (error: HttpErrorResponse) => {
        let err = error.error as ApiResponse<string>;
        this.snakeBar.open(`Registration failed: ${err.error}`, 'Close');
      },
      complete: () => {
        this.router.navigate(['/']);
      },
    });
  }
}
