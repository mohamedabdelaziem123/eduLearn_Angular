

export interface GetUploadUrlDto {

  originalname: string;


  ContentType: string;
}

export interface CreateLessonDto {
  title: string;
  description?: string;
  price: number;
  isFree?: boolean;
  order: number;
  videoKey: string; 
}
