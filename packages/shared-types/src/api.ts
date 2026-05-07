export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
  error?: null;
}

export interface ApiError {
  data?: null;
  error: {
    statusCode: number;
    message: string;
    code?: string;
  };
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}
