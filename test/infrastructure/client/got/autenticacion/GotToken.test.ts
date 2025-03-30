import got from 'got';
import { IAuntenticacionResponse } from '@infrastructure/client/got/autenticacion/interfaces';
import { GotTokenApi } from '@infrastructure/client/got/autenticacion/GotToken';

jest.mock('got');

describe('GotTokenApi', () => {
    const url = 'https://dummy-url.com';
    const token = 'jwt.token.fake';
    const headers = {
        'x-client-id': 'cliente1',
        'x-request-id': 'req1',
    };

    const gotTokenApi = new GotTokenApi();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería retornar true si la respuesta indica autorizado', async () => {
        (got.get as jest.Mock).mockResolvedValue({
            body: { autorizado: true } as IAuntenticacionResponse,
        });

        const result = await gotTokenApi.validarToken(url, headers, token);

        expect(got.get).toHaveBeenCalledWith(
            expect.objectContaining({
                url,
                headers: expect.objectContaining({
                    'x-client-id': 'cliente1',
                    'x-request-id': 'req1',
                    authorization: `Bearer ${token}`,
                }),
            }),
        );

        expect(result).toBe(true);
    });

    it('debería retornar false si la respuesta indica no autorizado', async () => {
        (got.get as jest.Mock).mockResolvedValue({
            body: { autorizado: false } as IAuntenticacionResponse,
        });

        const result = await gotTokenApi.validarToken(url, headers, token);
        expect(result).toBe(false);
    });

    it('debería retornar false si ocurre un error en la petición', async () => {
        (got.get as jest.Mock).mockRejectedValue(new Error('Falla en petición'));

        const result = await gotTokenApi.validarToken(url, headers, token);
        expect(result).toBe(false);
    });

    it('debería eliminar headers prohibidos en refactorHeaders', () => {
        const gotInstance = new GotTokenApi();
        const headersInput = {
            connection: 'keep-alive',
            host: 'test.com',
            'x-client-id': 'c1',
        };

        const result = (gotInstance as any).refactorHeaders(headersInput, token);

        expect(result).not.toHaveProperty('connection');
        expect(result).not.toHaveProperty('host');
        expect(result.authorization).toBe(`Bearer ${token}`);
        expect(result['x-client-id']).toBe('c1');
    });
});
