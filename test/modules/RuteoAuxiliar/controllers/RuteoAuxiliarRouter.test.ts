import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { IObtenerRuteoCompleto } from '@infrastructure/bd/interfaces/IObtenerRutas';
import {
    CustomRequest,
    IObtenerRutasDataIn,
    IValidarEquipoDataIn,
} from '@modules/Ruteo/application/data/in/IRuteoDataIn';
import RuteoAuxiliarRouter from '@modules/Ruteo/controllers/RuteoAuxiliarRouter';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';

// Suponemos que Result.ok y Result.failure retornan objetos con la siguiente estructura:
interface ResponseMethod<T> {
    data?: T;
    message: string;
    isError?: boolean;
    statusCode?: number;
}

interface Response<T> {
    response: ResponseMethod<T>;
    status: number;
}

// --- Mocks de las dependencias ---

// Mock para ValidarUsuarioUseCase
const mockValidarUsuarioUseCase = {
    execute: jest.fn().mockResolvedValue('validacion exitosa'),
};

// Mock para ObtenerRutasUseCase
const mockObtenerRutasUseCase = {
    execute: jest.fn().mockResolvedValue([{ ruta: 'ruta1' }] as unknown as IObtenerRuteoCompleto[]),
};

// Mock para TareaUseCase
const mockTareaUseCase = {
    execute: jest.fn().mockResolvedValue('prioridades actualizadas'),
};

// Mock para IEnviosRedis
const mockRedis = {
    flushAll: jest.fn().mockResolvedValue(undefined),
};

// --- Mock del JsonValidator para evitar validaciones reales en tests ---
jest.mock('@modules/shared/config/schemas', () => {
    return {
        JsonValidator: jest.fn().mockImplementation(() => {
            return {
                validate: (_schema: any, data: any) => data, // simplemente retorna los datos
            };
        }),
    };
});

// --- Tests ---
describe('RuteoAuxiliarRouter', () => {
    let router: RuteoAuxiliarRouter;
    let req: Partial<CustomRequest>;
    const logger = ['dummy logger']; // puede ser un arreglo con datos de log, según lo requieras

    beforeEach(() => {
        // Instanciamos el router
        router = new RuteoAuxiliarRouter();

        // Reiniciamos mocks
        jest.clearAllMocks();

        // Simulamos un request base
        req = {
            headers: {
                authorization: 'Bearer test-token',
                'x-client-id': 'dummy',
                'x-request-id': 'dummy',
            },
            data: {},
            logData: logger,
        };

        // Registra (o re-registra) las dependencias en el contenedor global para cada test

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.ValidarUsuarioUseCase)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.ValidarUsuarioUseCase);
        }
        GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.ValidarUsuarioUseCase).toConstantValue(mockValidarUsuarioUseCase);

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.ObtenerRutasUseCase)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.ObtenerRutasUseCase);
        }
        GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.ObtenerRutasUseCase).toConstantValue(mockObtenerRutasUseCase);

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.TareaUseCase)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.TareaUseCase);
        }
        GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.TareaUseCase).toConstantValue(mockTareaUseCase);

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.RedisRepoCache)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.RedisRepoCache);
        }
        GLOBAL_CONTAINER.bind(TYPESDEPENDENCIES.RedisRepoCache).toConstantValue(mockRedis);
    });

    describe('validarEquipoParaRuta', () => {
        it('debe retornar respuesta exitosa cuando ValidarUsuarioUseCase.execute se resuelve', async () => {
            // Preparamos datos dummy para el request
            req.data = {
                codigo_equipo: 'eq1',
                terminal: 1,
                placa_vehiculo: 'ABC123',
            } as IValidarEquipoDataIn;

            const response: Response<string> = await router.validarEquipoParaRuta(req as CustomRequest);
            expect(mockValidarUsuarioUseCase.execute).toHaveBeenCalled();
            expect(response.response.isError).toBeFalsy();
            expect(response.response.message).toBe('Ruta asignada');
            expect(response.response.data).toBe('validacion exitosa');
        });

        it('debe retornar respuesta de error cuando ValidarUsuarioUseCase.execute lanza error', async () => {
            // Forzamos un error en el use case
            mockValidarUsuarioUseCase.execute.mockRejectedValue(new Error('error validacion'));
            req.data = {
                codigo_equipo: 'eq1',
                terminal: 1,
                placa_vehiculo: 'ABC123',
            } as IValidarEquipoDataIn;

            const response: Response<string> = await router.validarEquipoParaRuta(req as CustomRequest);
            expect(response.response.isError).toBeTruthy();
            // Se espera que el status se defina en 501 según la implementación del router
            expect(response.status).toBe(501);
        });
    });

    describe('obtenerRutas', () => {
        it('debe retornar rutas correctamente cuando ObtenerRutasUseCase.execute se resuelve', async () => {
            req.data = {
                codigo_equipo: 'eq1',
                terminal_equipo: 1,
                fecha_ruta: '2025-03-29',
            } as IObtenerRutasDataIn;

            const response = (await router.obtenerRutas(req as CustomRequest)) as any;
            expect(mockObtenerRutasUseCase.execute).toHaveBeenCalled();
            expect(response.response.isError).toBeFalsy();
            expect(response.response.message).toBe('Rutas obtenidas correctamente');
            expect(response.response.data).toEqual([{ ruta: 'ruta1' }]);
        });

        it('debe retornar error cuando ObtenerRutasUseCase.execute falla', async () => {
            mockObtenerRutasUseCase.execute.mockRejectedValue(new Error('error obtener rutas'));
            req.data = {
                codigo_equipo: 'eq1',
                terminal_equipo: 1,
                fecha_ruta: '2025-03-29',
            } as IObtenerRutasDataIn;
            const response = await router.obtenerRutas(req as CustomRequest);
            expect((response.response as any).isError).toBeTruthy();
        });
    });

    describe('recalcularPrioridades', () => {
        it('debe retornar respuesta exitosa cuando TareaUseCase.execute se resuelve', async () => {
            const response: Response<string> = (await router.recalcularPrioridades(req as CustomRequest)) as any;
            expect(mockTareaUseCase.execute).toHaveBeenCalled();
            expect(response.response.isError).toBeFalsy();
            expect(response.response.message).toBe('Prioridades recalculadas correctamente');
            expect(response.response.data).toBe('prioridades actualizadas');
        });

        it('debe retornar error cuando TareaUseCase.execute falla', async () => {
            mockTareaUseCase.execute.mockRejectedValue(new Error('error recalcular'));
            const response: Response<string> = (await router.recalcularPrioridades(req as CustomRequest)) as any;
            expect(response.response.isError).toBeTruthy();
        });
    });

    describe('eliminarRedis', () => {
        it('debe llamar a flushAll y retornar respuesta exitosa', async () => {
            const response: Response<null> = await router.eliminarRedis();
            expect(mockRedis.flushAll).toHaveBeenCalled();
            expect(response.response.isError).toBeFalsy();
            expect(response.response.message).toBe('Datos eliminados exitosamente');
            expect(response.response.data).toBeNull();
        });
    });
});
