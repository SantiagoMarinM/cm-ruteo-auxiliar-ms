import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { TYPES } from '@common/dependencies';
import { ILogger } from '@common/logger';
import { IEnvioRepository } from '@modules/Ruteo/domain/repositories/EnvioRepository';
import IEnviosRedis from '@infrastructure/redis/interfaces/IClienteRedis';
import TareaUseCase from '@modules/Ruteo/useCase/TareaUseCase';

describe('TareaUseCase', () => {
    const mockEnvioRepository: Partial<IEnvioRepository> = {
        sincronizacionEnvios: jest.fn(),
    };

    const mockRedis: Partial<IEnviosRedis> = {
        obtenerEnvioPorPrioridad: jest.fn(),
        guardarRegistrosEnRedis: jest.fn(),
    };

    const mockLogger: ILogger = {
        add: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
    };

    beforeAll(() => {
        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.IEnvioRepository)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.IEnvioRepository);
        }
        GLOBAL_CONTAINER.bind<IEnvioRepository>(TYPESDEPENDENCIES.IEnvioRepository).toConstantValue(
            mockEnvioRepository as IEnvioRepository,
        );

        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.RedisRepoCache)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.RedisRepoCache);
        }
        GLOBAL_CONTAINER.bind<IEnviosRedis>(TYPESDEPENDENCIES.RedisRepoCache).toConstantValue(
            mockRedis as IEnviosRedis,
        );

        if (GLOBAL_CONTAINER.isBound(TYPES.Logger)) {
            GLOBAL_CONTAINER.unbind(TYPES.Logger);
        }
        GLOBAL_CONTAINER.bind<ILogger>(TYPES.Logger).toConstantValue(mockLogger);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería ejecutar correctamente el proceso y actualizar prioridades', async () => {
        const ahora = new Date();
        const hoy = ahora.toISOString();
        const dentroDe2Dias = new Date(ahora.getTime() + 36 * 60 * 60 * 1000).toISOString(); // entre 1 y 2 días
        const pasado = new Date(ahora.getTime() + 72 * 60 * 60 * 1000).toISOString(); // > 2 días

        const envios = [
            { id: 1, fecha_limite_entrega: hoy },
            { id: 2, fecha_limite_entrega: dentroDe2Dias },
            { id: 3, fecha_limite_entrega: pasado },
        ];

        (mockEnvioRepository.sincronizacionEnvios as jest.Mock).mockResolvedValue(undefined);
        (mockRedis.obtenerEnvioPorPrioridad as jest.Mock).mockImplementation((key: string) => {
            return key === 'envios_ruteo_1'
                ? envios.slice(0, 1)
                : key === 'envios_ruteo_2'
                ? envios.slice(1, 2)
                : key === 'envios_ruteo_3'
                ? envios.slice(2)
                : [];
        });

        const useCase = new TareaUseCase(mockLogger);
        const logData = ['log1'];

        const result = await useCase.execute(logData);

        expect(mockLogger.add).toHaveBeenCalledWith('info', 'Iniciando sincronización de prioridades', logData);
        expect(mockEnvioRepository.sincronizacionEnvios).toHaveBeenCalled();

        expect(mockRedis.guardarRegistrosEnRedis).toHaveBeenCalledWith(
            'envios_ruteo_1',
            expect.arrayContaining([expect.objectContaining({ id: 1, prioridad: 1 })]),
        );
        expect.arrayContaining([expect.objectContaining({ id: 2, prioridad: 2 })]);

        expect(mockRedis.guardarRegistrosEnRedis).toHaveBeenCalledWith(
            'envios_ruteo_3',
            expect.arrayContaining([expect.objectContaining({ id: 3, prioridad: 3 })]),
        );

        expect(mockLogger.add).toHaveBeenCalledWith('info', 'Sincronización de prioridades exitosa', logData);
        expect(result).toBe('Sincronización de prioridades exitosa');
    });
});
