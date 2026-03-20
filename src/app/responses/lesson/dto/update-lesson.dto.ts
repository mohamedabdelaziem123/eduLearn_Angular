
import { CreateLessonDto } from './create-lesson.dto';


export interface UpdateLessonDto extends Partial<CreateLessonDto> {
  // videoKey is optional on update — only present if teacher uploaded a new video
  
  videoKey?: string;
}
