//import { ApiException } from '@common/http/exceptions/Exceptions';
import { injectable } from 'inversify';
import 'reflect-metadata';
import got from 'got';
import { IAuntenticacionResponse, IGotTokenApi } from './interfaces';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });
@injectable()
export class GotTokenApi implements IGotTokenApi {
    async validarToken(url: string, header: Record<string, string>, token: string): Promise<boolean> {
        try {
            const newHeaders = this.refactorHeaders(header, token);
            const respuestaApi = await got.get<IAuntenticacionResponse>({
                url,
                responseType: 'json',
                timeout: 5000,
                headers: newHeaders,
                agent: {
                    https: agent,
                },
            });
            return respuestaApi.body.autorizado;
        } catch (e) {
            return false;
        }
    }

    private refactorHeaders(header: Record<string, string>, token: string) {
        const forbiddenHeaders = [
            'connection',
            'content-length',
            'transfer-encoding',
            'keep-alive',
            'upgrade',
            'host',
            'postman-token',
        ];

        const headers = {
            ...header,
            authorization: `Bearer ${token}`,
        };
        for (const h of forbiddenHeaders) {
            Reflect.deleteProperty(headers, h);
        }
        return headers;
    }
}
