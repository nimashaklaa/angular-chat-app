import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../Models/user';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-chat-sidebar',
  imports: [MatIcon, MatMenuModule, TitleCasePipe],
  templateUrl: './chat-sidebar.component.html',
  styles: ``,
})
export class ChatSidebarComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
