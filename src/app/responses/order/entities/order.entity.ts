import { orderStatusEnum } from '../../enums';
import { IUser } from '../../interfaces';
import { EntityId } from '../../types';


export interface LessonSnapshot {
  lessonId: EntityId;
  courseTitle: string;
  lessonTitle: string;
  lessonOrder: number;
  price: number;
}

export interface CreateOrderResponse {
  orderId: EntityId;
  totalAmount: number;
  status: orderStatusEnum;
}

export interface OrderResponse {
  _id: EntityId;
  
  // Student reference (can be populated)
  studentId: EntityId | IUser;
  
  // Immutable snapshot of purchased lessons
  lessons: LessonSnapshot[];
  
  // Payment details
  totalAmount: number;
  status: orderStatusEnum;
  paymentGateway: string;
  gatewayOrderId?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CheckoutSessionResponse {
  sessionURL: string;
}