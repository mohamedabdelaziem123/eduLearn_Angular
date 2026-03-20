import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IResponse } from '../responses/interfaces/response.interface';
import { CheckoutSessionResponse, CreateOrderResponse, OrderResponse } from '../responses/order/entities/order.entity';

import { environment } from '../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class OrderService {
    constructor(private http: HttpClient) {}

    /** POST /order — Create an order from the student's cart */
    createOrder(): Observable<IResponse<CreateOrderResponse>> {
        return this.http.post<IResponse<CreateOrderResponse>>(
            `${environment.apiUrl}/order`,
            {}
        );
    }

    /** POST /order/:orderId/checkout — Check out a pending order, returns a Paymob payment URL */
    checkOut(orderId: string): Observable<IResponse<CheckoutSessionResponse>> {
        return this.http.post<IResponse<CheckoutSessionResponse>>(
            `${environment.apiUrl}/order/${orderId}/checkout`,
            {}
        );
    }

    /** PATCH /order/:orderId/cancel — Cancel a pending order */
    cancel(orderId: string): Observable<IResponse<OrderResponse>> {
        return this.http.patch<IResponse<OrderResponse>>(
            `${environment.apiUrl}/order/${orderId}/cancel`,
            {}
        );
    }
}
