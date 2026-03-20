import { ICourse, IQuiz } from '../../interfaces';
import { EntityId } from '../../types';


export interface CreateLessonResponse {
  lessonId: EntityId;
  title: string;
  courseId: EntityId;
  order: number;
}

export interface LessonResponse {
  _id: EntityId;
  title: string;
  description: string;
  
  // Course reference (can be populated)
  courseId: EntityId | ICourse;
  
  // Video content
  videoUrl: string;
  videoFileId?: string;
  
  // Quiz reference (can be populated)
  quizId?: EntityId | IQuiz;
  
  // Commerce
  price: number;
  isFree: boolean;
  isHidden: boolean;
  
  // Ordering
  order: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}
