import { ICourse } from "../../interfaces";
import { EntityId } from "../../types";


export interface CreateSubjectResponse {
  subjectId: EntityId;
  name: string;
}

export interface SubjectResponse {
  _id: EntityId;
  name: string;
  description: string;
  
  // Course references (can be populated)
  courses: EntityId[] | ICourse[];
  
  createdAt?: Date;
  updatedAt?: Date;
}
