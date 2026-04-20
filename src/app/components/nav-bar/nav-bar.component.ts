import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../enviroment/enviroment';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {
    @Input() showFilter: boolean = true;
    @Input() showBell: boolean = true;
    @Input() isTeacherNav: boolean = false;
    @Input() activeRoute: string = '';

    adminProfile: any = null;
    userRole: string | null = null;

    constructor(
        private adminService: AdminService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.userRole = this.authService.getRole()?.toLowerCase() || null;
        
        if (typeof window !== 'undefined' && window.document) {
            this.adminService.getUserProfile().subscribe({
                next: (res: any) => {
                    this.adminProfile = res?.user || res?.data || res;
                    // Update role from profile if available
                    if (this.adminProfile?.role) {
                        this.userRole = this.adminProfile.role.toLowerCase();
                    }
                },
                error: (err: any) => console.error('Error loading profile:', err)
            });
        }
    }

    logout(): void {
        this.authService.logout();
    }

    get isStudent(): boolean {
        // If on a dashboard route, definitely not a student view
        if (this.router.url.includes('/dashboard')) return false;

        // If teacher nav is explicitly set, not student
        if (this.isTeacherNav) return false;

        const role = this.adminProfile?.role?.toLowerCase() || this.userRole;
        
        // If role is admin or teacher, hide student elements
        if (role === 'admin' || role === 'teacher') return false;

        // Only show student elements if we positively know it's a student
        return role === 'student';
    }

    getImageUrl(image: string | undefined | null): string {
        if (!image) return '';
        const cleanImage = image.trim().replace(/^['"]|['"]$/g, '');
        if (cleanImage.startsWith('http://') || cleanImage.startsWith('https://')) {
            return cleanImage;
        }
        return `${environment.cdnUrl}/${cleanImage}`;
    }
}
