export declare class PaginationDto {
    limit: number;
    page: number;
    get skip(): number;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
