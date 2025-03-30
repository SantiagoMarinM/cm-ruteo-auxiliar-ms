import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { IDatabase } from 'pg-promise';
import { UNAUTHORIZED } from '@common/http/exceptions';
import { IUsuariosVehiculos } from '@infrastructure/bd/interfaces/IUsuariosVehiculos';
import { EquipoVehiculoDAO } from '@infrastructure/bd/postgresql/dao/EquipoVehiculoDAO';

jest.mock('@infrastructure/bd/postgresql/dao/querys/RuteoQueries', () => ({
    obtenerVehiculoyEquipo: 'SELECT * FROM obtener_equipo_vehiculo($1, $2, $3);',
}));

describe('EquipoVehiculoDAO', () => {
    const dbMock: Partial<IDatabase<unknown>> = {
        oneOrNone: jest.fn(),
    };

    beforeAll(() => {
        if (GLOBAL_CONTAINER.isBound(TYPESDEPENDENCIES.Postgresql)) {
            GLOBAL_CONTAINER.unbind(TYPESDEPENDENCIES.Postgresql);
        }

        GLOBAL_CONTAINER.bind<IDatabase<unknown>>(TYPESDEPENDENCIES.Postgresql).toConstantValue(
            dbMock as IDatabase<unknown>,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const equipo = 'EQUIPO1';
    const terminal = 1;
    const placa = 'ABC123';

    it('debería retornar el objeto de equipo-vehículo si existe', async () => {
        const mockResultado: IUsuariosVehiculos = {
            id_equipos_vehiculos: 123,
            id_equipo: 1,
            id_vehiculo: 2,
            vehiculo_activo: true,
            equipo_activo: true,
            latitud_actual: '6.2',
            longitud_actual: '-75.5',
            capacidad_peso: 1000,
            capacidad_volumen: 1000,
            placa_vehiculo: 'ABC123',
            terminal: 1,
        };

        (dbMock.oneOrNone as jest.Mock).mockResolvedValueOnce(mockResultado);

        const dao = new EquipoVehiculoDAO();
        const result = await dao.obtener(equipo, terminal, placa);

        expect(dbMock.oneOrNone).toHaveBeenCalledWith(expect.any(String));
        expect(result).toEqual(mockResultado);
    });

    it('debería retornar null si no hay resultado', async () => {
        (dbMock.oneOrNone as jest.Mock).mockResolvedValueOnce(null);

        const dao = new EquipoVehiculoDAO();
        const result = await dao.obtener(equipo, terminal, placa);

        expect(result).toBeNull();
    });

    it('debería lanzar UNAUTHORIZED si ocurre un error en la consulta', async () => {
        (dbMock.oneOrNone as jest.Mock).mockRejectedValueOnce(new Error('Fallo DB'));

        const dao = new EquipoVehiculoDAO();
        const promise = dao.obtener(equipo, terminal, placa);

        await expect(promise).rejects.toBeInstanceOf(UNAUTHORIZED);
        await expect(promise).rejects.toMatchObject({
            statusCode: 401,
            error: {
                message: 'Error al consultar equipo vehículo',
            },
        });
    });
});
