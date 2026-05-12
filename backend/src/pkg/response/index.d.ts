import { Response } from 'express';
export declare function success(res: Response, data?: unknown, status?: number): Response<any, Record<string, any>>;
export declare function fail(res: Response, message: string, code?: number, status?: number): Response<any, Record<string, any>>;
export declare function paginated(res: Response, data: unknown[], total: number, page: number, pageSize: number): Response<any, Record<string, any>>;
//# sourceMappingURL=index.d.ts.map