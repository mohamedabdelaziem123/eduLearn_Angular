

export interface GetAllResponse<T = any> {
  DocCount: number | undefined;
  pages: number | undefined;
  currentPage: number | undefined | 'all';
  limit: number | undefined;
  Result: T[];
}


