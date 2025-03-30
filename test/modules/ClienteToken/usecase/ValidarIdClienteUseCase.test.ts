import ValidarIdClienteUseCase from '@modules/Ruteo/useCase/ValidarIdClienteUseCase';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { UNAUTHORIZED } from '@common/http/exceptions';
import { IEquipoVehiculoRepository } from '@modules/Ruteo/domain/repositories/EquipoVehiculoRepository';
import IEnviosRedis from '@infrastructure/redis/interfaces/IClienteRedis';

jest.mock('@common/dependencies/DependencyContainer');

describe('ValidarIdClienteUseCase', () => {
    let validarIdClienteUseCase: ValidarIdClienteUseCase;
    let redisMock: jest.Mocked<IEnviosRedis>;
    let repositoryMock: jest.Mocked<IEquipoVehiculoRepository>;

    beforeEach(() => {
        redisMock = {
            getIdCliente: jest.fn(),
            setClienteToken: jest.fn(),
        } as unknown as jest.Mocked<IEnviosRedis>;

        repositoryMock = {
            validarIdCliente: jest.fn(),
        } as unknown as jest.Mocked<IEquipoVehiculoRepository>;

        (GLOBAL_CONTAINER.get as jest.Mock).mockImplementation((type) => {
            if (type === TYPESDEPENDENCIES.RedisRepoCache) return redisMock;
            if (type === TYPESDEPENDENCIES.IEquipoVehiculoRepository) return repositoryMock;
            return null;
        });

        validarIdClienteUseCase = new ValidarIdClienteUseCase();
    });

    it('debería retornar el cliente desde Redis si existe', async () => {
        const id_cliente = '123';
        const mockCliente = { activo: true, apikey: 'api-key', tiempo_expiracion: '2h' };
        redisMock.getIdCliente.mockResolvedValue(mockCliente);

        const result = await validarIdClienteUseCase.execute(id_cliente);

        expect(result).toEqual(mockCliente);
        expect(redisMock.getIdCliente).toHaveBeenCalledWith(`auth${id_cliente}`);
        expect(repositoryMock.validarIdCliente).not.toHaveBeenCalled();
    });

    it('debería buscar en el repositorio si el cliente no está en Redis', async () => {
        const id_cliente = '123';
        const mockCliente = { activo: true, apikey: 'api-key', tiempo_expiracion: '1h' };
        redisMock.getIdCliente.mockResolvedValue(null);
        repositoryMock.validarIdCliente.mockResolvedValue(mockCliente);

        const result = await validarIdClienteUseCase.execute(id_cliente);

        expect(result).toEqual(mockCliente);
        expect(redisMock.getIdCliente).toHaveBeenCalledWith(`auth${id_cliente}`);
        expect(repositoryMock.validarIdCliente).toHaveBeenCalledWith(id_cliente);
        expect(redisMock.guardarRegistrosEnREdis).toHaveBeenCalledWith(`auth${id_cliente}`, {
            activo: mockCliente.activo,
            tiempo_expiracion: mockCliente.tiempo_expiracion,
        });
    });

    it('debería lanzar un error si el cliente no se encuentra', async () => {
        const id_cliente = '123';
        redisMock.getIdCliente.mockResolvedValue(null);
        repositoryMock.validarIdCliente.mockResolvedValue(null);

        await expect(validarIdClienteUseCase.execute(id_cliente)).rejects.toBeInstanceOf(UNAUTHORIZED);

        expect(redisMock.getIdCliente).toHaveBeenCalledWith(`auth${id_cliente}`);
        expect(repositoryMock.validarIdCliente).toHaveBeenCalledWith(id_cliente);
        expect(redisMock.guardarRegistrosEnREdis).not.toHaveBeenCalled();
    });
});
