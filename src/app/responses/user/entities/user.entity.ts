import { GenderEnum, providerEnum, RoleEnum } from "../../enums";
import { ILesson } from "../../interfaces";
import { EntityId } from "../../types";


export interface UserResponse {
  _id: EntityId;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  
  // Optional fields
  phone?: string;
  address?: string;
  profileImage?: string;
  confirmedAt?: Date;
  
  // Purchased lessons (can be populated)
  boughtLessons: EntityId[] | ILesson[];
  
  // User metadata
  provider: providerEnum;
  gender: GenderEnum;
  role: RoleEnum;
  
  // Teacher-specific
  degree?: string;
  
  // Student-specific
  isBlocked?: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfileResponse {
  profile: UserResponse;
}
