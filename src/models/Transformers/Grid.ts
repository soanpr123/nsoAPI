export interface GridInterface<T> {
    data: T[];
    total: number;
    page?: number;
    pageSize?: number;
}
