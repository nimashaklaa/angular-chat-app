import { Component, inject, signal } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule,MatIconModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email!: string;
  password!: string;
  fullName!: string;
  profilePicture: string = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  profileImage: File |null = null;

  authService = inject(AuthServiceService);

  hide = signal(true);

  togglePassword(event:MouseEvent) {
    this.hide.set(!this.hide());
  }

}
