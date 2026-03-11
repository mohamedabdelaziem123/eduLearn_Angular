import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent {
    // Logic is now heavily delegated to NavbarComponent 
    // and other feature components to come.
}
