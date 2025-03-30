import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { TYPES } from '@common/dependencies';
import CustomError from '@common/utils/CustomError';
import { IRutaRepository } from '@modules/Ruteo/domain/repositories/RutaRepository';
import { IObtenerRuteoCompleto } from '@infrastructure/bd/interfaces/IObtenerRutas';
import { ILogger } from '@common/logger';
import ObtenerRutasUseCase from '@modules/Ruteo/useCase/ObtenerRutasUseCase';

describe('ObtenerRutasUseCase', () => {
    const mockRutaRepository: Partial<IRutaRepository> = {
        obtenerRutas: jest.fn(),
    };

    const mockLogger: ILogger = {
        add: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
    };

    beforeAll(() => {
        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.IRutaRepository)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.IRutaRepository);
        }
        GLOBAL_CONTAINER.bind<IRutaRepository>(TYPESDEPENDENCIES.IRutaRepository).toConstantValue(
            mockRutaRepository as IRutaRepository,
        );

        if (GLOBAL_CONTAINER.isBound(TYPES.Logger)) {
            GLOBAL_CONTAINER.unbind(TYPES.Logger);
        }
        GLOBAL_CONTAINER.bind<ILogger>(TYPES.Logger).toConstantValue(mockLogger);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const dummyData = {
        codigo_equipo: 'EQUIPO123',
        terminal_equipo: 1,
        fecha_ruta: '2025-03-30',
    };

    const logData = ['log-info'];

    it('debería retornar rutas correctamente', async () => {
        const mockRutas: IObtenerRuteoCompleto[] = [
            { ruta: 'ruta1', otra: 'info' } as unknown as IObtenerRuteoCompleto,
        ];

        (mockRutaRepository.obtenerRutas as jest.Mock).mockResolvedValueOnce(mockRutas);

        const useCase = new ObtenerRutasUseCase(mockLogger);
        const result = await useCase.execute(dummyData, logData);

        expect(mockLogger.add).toHaveBeenCalledWith('info', 'Obteniendo rutas', logData);
        expect(mockRutaRepository.obtenerRutas).toHaveBeenCalledWith(
            dummyData.codigo_equipo,
            dummyData.terminal_equipo,
            dummyData.fecha_ruta,
        );
        expect(result).toEqual(mockRutas);
    });

    it('debería lanzar CustomError si ocurre un error en el repositorio', async () => {
        const error = new Error('DB failed');
        (mockRutaRepository.obtenerRutas as jest.Mock).mockRejectedValueOnce(error);

        const useCase = new ObtenerRutasUseCase(mockLogger);
        const promise = useCase.execute(dummyData, logData);

        await expect(promise).rejects.toThrow(CustomError);
        await expect(promise).rejects.toMatchObject({
            message: 'DB failed',
        });
    });
});
