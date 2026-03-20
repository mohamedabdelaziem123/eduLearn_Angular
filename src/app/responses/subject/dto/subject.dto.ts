

export interface CreateSubjectDto {
  
    name: string;

 
    description?: string;
}

export interface UpdateSubjectDto {

    name?: string;


    description?: string;
}

export interface SubjectParamsDto {

    id: string;
}
