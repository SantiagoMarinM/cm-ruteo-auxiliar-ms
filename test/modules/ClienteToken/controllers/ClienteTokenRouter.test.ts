import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import RutearRouter from '@modules/Ruteo/controllers/RuteoRouter';
import RutearUseCase from '@modules/Ruteo/useCase/RutearUseCase';
import ValidarTokenUseCase from '@modules/Ruteo/useCase/ValidarTokenUseCase';
import IEnviosRedis from '@infrastructure/redis/interfaces/IClienteRedis';
import { ErrorCode, InternalError, UNAUTHORIZED } from '@common/http/exceptions';
import { TOKEN_EXPIRADO } from '@modules/Ruteo/constants/errorMessages';

jest.mock('@common/dependencies/DependencyContainer');
jest.mock('@modules/shared/config/schemas'); // Mock del validador

describe('ClienteTokenRouter', () => {
    let router: RutearRouter;
    let generarTokenUseCase: jest.Mocked<RutearUseCase>;
    let validarTokenUseCase: jest.Mocked<ValidarTokenUseCase>;
    let redis: jest.Mocked<IEnviosRedis>;

    beforeEach(() => {
        generarTokenUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RutearUseCase>;
        validarTokenUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ValidarTokenUseCase>;
        redis = { flushAll: jest.fn() } as unknown as jest.Mocked<IEnviosRedis>;

        // Mock de GLOBAL_CONTAINER.get
        (GLOBAL_CONTAINER.get as jest.Mock).mockImplementation((type: symbol) => {
            switch (type) {
                case TYPESDEPENDENCIES.RutearUseCase:
                    return generarTokenUseCase;
                case TYPESDEPENDENCIES.ValidarTokenUseCase:
                    return validarTokenUseCase;
                case TYPESDEPENDENCIES.RedisRepoCache:
                    return redis;
                default:
                    return null;
            }
        });

        router = new RutearRouter();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generarToken', () => {
        it('debería generar un token correctamente', async () => {
            const mockHeaders = { cliente: 'test', clave: '1234' };
            const mockToken = 'test_token';

            generarTokenUseCase.execute.mockResolvedValue(mockToken);

            const req = { headers: mockHeaders } as any;
            const res = await router.asignarRuta(req);

            expect(generarTokenUseCase.execute).toHaveBeenCalledWith(mockHeaders);
            expect(res.status).toBe(200);
            expect(res.response).toEqual({
                isError: false,
                autorizado: true,
                statusCode: 200,
                token: mockToken,
                message: 'Token generado exitosamente',
            });
        });

        it('debería manejar error al generar un token', async () => {
            const mockHeaders = { cliente: 'test', clave: '1234' };
            const mockError = new InternalError('Error al generar el token', ErrorCode.INTERNAL_ERROR);

            generarTokenUseCase.execute.mockRejectedValue(mockError);

            const req = { headers: mockHeaders } as any;
            const res = await router.asignarRuta(req);

            expect(res.status).toBe(500);
            expect(res.response.message).toEqual('Error al generar el token');
        });
    });

    describe('validarToken', () => {
        it('debería validar un token correctamente', async () => {
            const mockHeaders = {
                authorization: 'Bearer test_token',
                'x-client-id': 'cliente123',
            };

            validarTokenUseCase.execute.mockResolvedValue(undefined);

            const req = { headers: mockHeaders } as any;
            const res = await router.validarToken(req);

            expect(validarTokenUseCase.execute).toHaveBeenCalledWith('cliente123', 'test_token');
            expect(res.status).toBe(200);
            expect(res.response.message).toBe('Token válido');
        });

        it('debería manejar error al validar un token', async () => {
            const mockHeaders = {
                authorization: 'Bearer test_token',
                'x-client-id': 'cliente123',
            };

            const mockError = new UNAUTHORIZED('Token inválido', '401', TOKEN_EXPIRADO);
            validarTokenUseCase.execute.mockRejectedValue(mockError);

            const req = { headers: mockHeaders } as any;
            const res = await router.validarToken(req);

            expect(res.status).toBe(401);
            expect(res.response.message).toBe('Token inválido');
        });
    });

    describe('eliminarRedis', () => {
        it('debería eliminar datos de Redis correctamente', async () => {
            const res = await router.eliminarRedis();

            expect(redis.flushAll).toHaveBeenCalled();
            expect(res.status).toBe(200);
            expect(res.response.message).toBe('Datos eliminados exitosamente');
        });
    });
});
