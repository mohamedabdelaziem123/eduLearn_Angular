import { DifficultyLevel, QuestionType } from "../../enums";


interface OptionDto {

  text: string;

 
  isCorrect: boolean;
}

export interface CreateQuestionDto {

  title: string;


  type: QuestionType;

 
  difficulty: DifficultyLevel;

  

  options: OptionDto[];

  lessonId?: string;


  courseId?: string;
}
