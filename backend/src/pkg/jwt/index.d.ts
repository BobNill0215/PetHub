export interface TokenPayload {
    userId: number;
    uuid: string;
    role: string;
}
export declare function signToken(payload: TokenPayload): string;
export declare function verifyToken(token: string): TokenPayload;
//# sourceMappingURL=index.d.ts.map