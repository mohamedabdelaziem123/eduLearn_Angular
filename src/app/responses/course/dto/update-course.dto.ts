
import { CourseStatus } from '../../enums';
import { CreateBlankCourseDto } from './create-course.dto';


export interface UpdateCourseDto extends Partial<CreateBlankCourseDto> {



  title?: string;




  description?: string;



  teacherId?: string;



  subjectId?: string;



  status?: CourseStatus; // Allows Admin to publish/archive
}
