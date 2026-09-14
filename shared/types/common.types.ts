export type BaseEntity = { id: string }; export type ApiResponse<T> = { data: T }; export type Pagination = { page: number; pageSize: number; total: number };
