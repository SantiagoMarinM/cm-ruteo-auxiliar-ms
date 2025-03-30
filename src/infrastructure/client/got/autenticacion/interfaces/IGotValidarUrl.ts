export interface IGotTokenApi {
    validarToken(url: string, header: Record<string, string>, token: string): Promise<boolean>;
}
