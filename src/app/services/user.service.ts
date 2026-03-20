import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProfileDto } from '../responses/user/dto/update-user.dto';
import { UserResponse } from '../responses/user/entities/user.entity';
import { IResponse } from '../responses/interfaces/response.interface';
import { AuthService } from './auth.service';

import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        let token = this.authService.getAccessToken();

        if (token && token !== 'undefined' && token !== 'null') {
            token = token.replace(/['"]+/g, '');
            token = token.replace(/^Bearer\s+/i, '');

            return new HttpHeaders({
                'Authorization': `Bearer ${token}`
            });
        }
        return new HttpHeaders();
    }

    getProfile(): Observable<IResponse<UserResponse>> {
        return this.http.get<IResponse<UserResponse>>(`${environment.apiUrl}/user/profile`, { headers: this.getHeaders() });
    }

    updateProfile(body: UpdateProfileDto): Observable<IResponse<UserResponse>> {
        return this.http.patch<IResponse<UserResponse>>(`${environment.apiUrl}/user/profile`, body, { headers: this.getHeaders() });
    }

    updateProfileImage(file: FormData): Observable<IResponse<UserResponse>> {
        return this.http.post<IResponse<UserResponse>>(`${environment.apiUrl}/user/profile/image`, file, { headers: this.getHeaders() });
    }

    removeProfileImage(): Observable<IResponse<UserResponse>> {
        return this.http.delete<IResponse<UserResponse>>(`${environment.apiUrl}/user/profile/image`, { headers: this.getHeaders() });
    }
}

