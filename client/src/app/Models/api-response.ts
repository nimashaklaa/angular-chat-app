export interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    error:string;
    message: string;
}