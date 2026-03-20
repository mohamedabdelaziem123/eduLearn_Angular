

export interface CreateQuizDto {

  title: string;

 
  description?: string;

  timeLimitMinutes?: number;

  
  minimumPassScore: number;


  lessonId?: string;


  courseId: string;

  /** Number of questions to pick from EACH difficulty level (EASY, MEDIUM, HARD).
   *  Total quiz questions = questionsPerLevel × 3 */

  questionsPerLevel: number;
}
