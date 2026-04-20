import { EntityId } from '../../types';

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATED RESULTS (Teacher: getResultsByLesson / getResultsByCourse)
// ═══════════════════════════════════════════════════════════════════════════

export interface PaginatedResultStudent {
  _id: EntityId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}

export interface PaginatedResultQuiz {
  _id: EntityId;
  title: string;
}

export interface PaginatedResultItem {
  _id: EntityId;
  score: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  attemptNumber: number;
  createdAt: Date;
  student: PaginatedResultStudent;
  quiz: PaginatedResultQuiz;
}

export interface QuizResultPaginatedResponse {
  results: PaginatedResultItem[];
  totalCount: number;
  averageScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ATTEMPT DETAIL (Teacher: getAttemptForTeacher / Student: getAttempt)
// ═══════════════════════════════════════════════════════════════════════════

export interface QuestionOption {
  _id: EntityId;
  text: string;
  isCorrect: boolean;
}

export interface ReviewItem {
  questionId: EntityId;
  questionTitle: string;
  questionType: string;
  options: QuestionOption[];
  studentAnswer: string;
  isCorrect: boolean;
}

export interface QuizAttemptDetailResponse {
  _id: EntityId;
  quizId: EntityId;
  quizTitle: string;
  studentId?: EntityId;
  score: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  attemptNumber: number;
  review: ReviewItem[];
}

// ═══════════════════════════════════════════════════════════════════════════
// START QUIZ (Student)
// ═══════════════════════════════════════════════════════════════════════════

export interface StartQuizOption {
  _id: EntityId;
  id?: EntityId;
  text: string;
}

export interface StartQuizQuestion {
  _id: EntityId;
  id?: EntityId;
  title: string;
  type: string;
  options: StartQuizOption[];
}

export interface StartQuizResponse {
  _id: EntityId;
  id?: EntityId;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: StartQuizQuestion[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBMIT QUIZ (Student — raw result document)
// ═══════════════════════════════════════════════════════════════════════════

export interface AnswerRecordResponse {
  questionId: EntityId;
  studentAnswer: string;
  isCorrect: boolean;
}

export interface QuizResultResponse {
  _id: EntityId;
  studentId: EntityId;
  quizId: EntityId;
  lessonId?: EntityId;
  courseId?: EntityId;
  score: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  answers: AnswerRecordResponse[];
  attemptNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// MY ATTEMPTS (Student — grouped by course)
// ═══════════════════════════════════════════════════════════════════════════

export interface AttemptSummary {
  attemptId: EntityId;
  quizTitle: string;
  lessonTitle: string | null;
  lessonId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  isPassed: boolean;
  attemptNumber: number;
  createdAt: Date;
}

export interface MyAttemptsGroupedResponse {
  courseId: string;
  courseTitle: string;
  attempts: AttemptSummary[];
}

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE (Student)
// ═══════════════════════════════════════════════════════════════════════════

export interface LessonPerformanceResponse {
  studentScore: number | null;
  lessonAverageScore: number;
}

export interface CoursePerformanceResponse {
  studentTotalCourseScore: number;
  courseAverageScore: number;
}
