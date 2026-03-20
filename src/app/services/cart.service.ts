import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponse } from '../responses/interfaces/response.interface';
import { AddToCartDto, RemoveFromCartDto } from '../responses/cart/dto/create-cart.dto';
import { CartResponse } from '../responses/cart/entities/cart.entity';

import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class CartService {
    constructor(private http: HttpClient) {}

    /** GET /cart — Get the student's cart */
    getCart(): Observable<IResponse<CartResponse>> {
        return this.http.get<IResponse<CartResponse>>(
            `${environment.apiUrl}/cart`
        );
    }

    /** PATCH /cart/add — Add a lesson to the cart */
    addToCart(body: AddToCartDto): Observable<IResponse<CartResponse>> {
        return this.http.patch<IResponse<CartResponse>>(
            `${environment.apiUrl}/cart/add`,
            body
        );
    }

    /** PATCH /cart/remove — Remove a lesson from the cart */
    removeFromCart(body: RemoveFromCartDto): Observable<IResponse<CartResponse>> {
        return this.http.patch<IResponse<CartResponse>>(
            `${environment.apiUrl}/cart/remove`,
            body
        );
    }

    /** DELETE /cart/clear — Clear the entire cart */
    clearCart(): Observable<IResponse<void>> {
        return this.http.delete<IResponse<void>>(
            `${environment.apiUrl}/cart/clear`
        );
    }
}
