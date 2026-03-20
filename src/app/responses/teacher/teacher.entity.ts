import { GenderEnum, RoleEnum } from "../enums";
import { ICourse } from "../interfaces";
import { EntityId } from "../types";


export interface TeacherResponse {
  _id: EntityId;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  
  // Teacher-specific
  degree: string;
  
  // Optional fields
  phone?: string;
  address?: string;
  profileImage?: string;
  
  // Metadata
  gender: GenderEnum;
  role: RoleEnum;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeacherWithCoursesResponse extends TeacherResponse {
  // Assigned courses (can be populated)
  assignedCourses?: ICourse[];
}
