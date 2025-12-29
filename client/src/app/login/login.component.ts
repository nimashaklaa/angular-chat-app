import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  imports: [MatInputModule, MatIconModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email!: string;
  password!: string;

  hide = signal(false);

  togglePassword(event:MouseEvent) {
    this.hide.set(!this.hide());
  }

  login() {
    // Implement login logic here
  }

}
