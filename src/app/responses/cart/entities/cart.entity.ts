import { ILesson, IUser } from '../../interfaces';
import { EntityId } from '../../types';


export interface CartResponse {
  _id: EntityId;
  
  // Student reference (can be populated)
  studentId: EntityId | IUser;
  
  // Lesson references (can be populated)
  lessonIds: EntityId[] | ILesson[];
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddToCartResponse {
  message: string;
  cartItemsCount: number;
}

export interface RemoveFromCartResponse {
  message: string;
  cartItemsCount: number;
}
