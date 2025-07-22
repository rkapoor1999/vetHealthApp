import { PaginatedResult } from '../dto/pagination.dto';
export declare function createPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
