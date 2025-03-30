import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { TYPES } from '@common/dependencies';
import EVENTO_RUTEO from '@infrastructure/pubsub/Topics';
import CustomError from '@common/utils/CustomError';
import ValidarUsuarioUseCase from '@modules/Ruteo/useCase/ValidarUsuarioUseCase';

function safeBindOrRebind<T>(token: symbol, value: T) {
    if (GLOBAL_CONTAINER.isBound(token)) {
        GLOBAL_CONTAINER.rebind(token).toConstantValue(value);
    } else {
        GLOBAL_CONTAINER.bind(token).toConstantValue(value);
    }
}

describe('ValidarUsuarioUseCase', () => {
    const mockLogger = { add: jest.fn() };
    const mockEquipoVehiculoRepo = {
        obtener: jest.fn(),
    };
    const mockRutaRepo = {
        validarEquipoRuteado: jest.fn(),
    };
    const mockPubSub = {
        publish: jest.fn(),
    };
    const mockGotToken = {
        validarToken: jest.fn(),
    };

    const data = {
        codigo_equipo: 'EQ1',
        terminal: 1,
        placa_vehiculo: 'ABC123',
    };

    const headers = {
        authorization: 'Bearer token',
    };

    const logData = ['log'];

    const equipoVehiculoMock = {
        id_equipos_vehiculos: 123,
        vehiculo_activo: true,
        equipo_activo: true,
    };

    beforeAll(() => {
        safeBindOrRebind(TYPES.Logger, mockLogger);
        safeBindOrRebind(TYPESDEPENDENCIES.IEquipoVehiculoRepository, mockEquipoVehiculoRepo);
        safeBindOrRebind(TYPESDEPENDENCIES.IRutaRepository, mockRutaRepo);
        safeBindOrRebind(TYPES.Publisher, mockPubSub);
        safeBindOrRebind(TYPESDEPENDENCIES.GotTokenApi, mockGotToken);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería retornar mensaje de éxito si todo sale bien', async () => {
        mockGotToken.validarToken.mockResolvedValue(true);
        mockEquipoVehiculoRepo.obtener.mockResolvedValue(equipoVehiculoMock);
        mockRutaRepo.validarEquipoRuteado.mockResolvedValue(false);

        const useCase = new ValidarUsuarioUseCase(mockLogger as any);
        const result = await useCase.execute(data, headers, 'jwt.token', logData);

        expect(mockGotToken.validarToken).toHaveBeenCalled();
        expect(mockEquipoVehiculoRepo.obtener).toHaveBeenCalled();
        expect(mockRutaRepo.validarEquipoRuteado).toHaveBeenCalled();
        expect(mockPubSub.publish).toHaveBeenCalledWith(EVENTO_RUTEO, {
            ...equipoVehiculoMock,
            terminal: 1,
        });
        expect(mockLogger.add).toHaveBeenCalledWith('info', 'Validacion Exitosa', logData);
        expect(result).toBe('Envio a ruteo exitoso');
    });

    it('debería lanzar error si el token es inválido', async () => {
        mockGotToken.validarToken.mockResolvedValue(false);

        const useCase = new ValidarUsuarioUseCase(mockLogger as any);
        await expect(useCase.execute(data, headers, 'token', logData)).rejects.toThrow(CustomError);
    });

    it('debería lanzar error si el equipo está inactivo', async () => {
        mockGotToken.validarToken.mockResolvedValue(true);
        mockEquipoVehiculoRepo.obtener.mockResolvedValue({
            ...equipoVehiculoMock,
            equipo_activo: false,
        });

        const useCase = new ValidarUsuarioUseCase(mockLogger as any);
        await expect(useCase.execute(data, headers, 'token', logData)).rejects.toThrow(CustomError);
    });

    it('debería lanzar error si el vehículo está inactivo', async () => {
        mockGotToken.validarToken.mockResolvedValue(true);
        mockEquipoVehiculoRepo.obtener.mockResolvedValue({
            ...equipoVehiculoMock,
            vehiculo_activo: false,
        });

        const useCase = new ValidarUsuarioUseCase(mockLogger as any);
        await expect(useCase.execute(data, headers, 'token', logData)).rejects.toThrow(CustomError);
    });

    it('debería lanzar error si el equipo ya está ruteado', async () => {
        mockGotToken.validarToken.mockResolvedValue(true);
        mockEquipoVehiculoRepo.obtener.mockResolvedValue(equipoVehiculoMock);
        mockRutaRepo.validarEquipoRuteado.mockResolvedValue(true);

        const useCase = new ValidarUsuarioUseCase(mockLogger as any);
        await expect(useCase.execute(data, headers, 'token', logData)).rejects.toThrow(CustomError);
    });
});
