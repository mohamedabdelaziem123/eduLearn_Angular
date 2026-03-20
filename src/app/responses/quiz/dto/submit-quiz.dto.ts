

interface AnswerDto {
  
  questionId: string;


  selectedAnswer: string;
}

export interface SubmitQuizDto {
  
  answers: AnswerDto[];
}
