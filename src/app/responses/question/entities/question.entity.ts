import { DifficultyLevel, QuestionType } from "../../enums";
import { ICourse, ILesson, IOption } from "../../interfaces";
import { EntityId } from "../../types";


export interface CreateQuestionResponse {
  questionId: EntityId;
  title: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
}

export interface OptionResponse extends IOption {

}

export interface QuestionResponse {
  _id: EntityId;
  title: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  
  // Options for the question
  options: OptionResponse[];
  
  // References (can be populated)
  lessonId?: EntityId | ILesson;
  courseId?: EntityId | ICourse;
  
  createdAt?: Date;
  updatedAt?: Date;
}
