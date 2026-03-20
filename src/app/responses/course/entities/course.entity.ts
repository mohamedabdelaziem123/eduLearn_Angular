
import { CourseStatus } from '../../enums';
import { ISubject, IUser } from '../../interfaces';
import { EntityId } from '../../types';

export interface CreateCourseResponse {
  courseId: EntityId;
  title: string;
  teacherId: EntityId;
  status: string;
}

// The main response entity
export interface CourseResponse {
  _id: EntityId;
  title: string;
  description: string;
  image?: string;
  status: CourseStatus;

  // Notice these are now the populated objects, not just ObjectIds!
  teacherId: EntityId | IUser;
  subjectId: EntityId | ISubject;

  // These are still arrays of ObjectIds until we populate them later
  lessons?: EntityId[];
  quizzes?: EntityId[];

  createdAt?: Date;
  updatedAt?: Date;
}
