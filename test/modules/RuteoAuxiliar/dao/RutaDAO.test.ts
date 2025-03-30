import { IDatabase } from 'pg-promise';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { RutaDAO } from '@infrastructure/bd/postgresql/dao/RutaDAO';

jest.mock('@infrastructure/bd/postgresql/dao/querys/RuteoQueries', () => ({
    validarEquipoYaRuteado: 'SELECT * FROM validar_equipo_ruteado($1);',
    obtenerRutas: 'SELECT * FROM obtener_rutas($1, $2, $3);',
}));

describe('RutaDAO', () => {
    const dbMock: Partial<IDatabase<unknown>> = {
        oneOrNone: jest.fn(),
        manyOrNone: jest.fn(),
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

    it('debería retornar true si hay respuesta en validarEquipoRuteado', async () => {
        (dbMock.oneOrNone as jest.Mock).mockResolvedValueOnce({});

        const dao = new RutaDAO();
        const result = await dao.validarEquipoRuteado(123);
        expect(result).toBe(true);
    });

    it('debería retornar false si no hay respuesta en validarEquipoRuteado', async () => {
        (dbMock.oneOrNone as jest.Mock).mockResolvedValueOnce(null);

        const dao = new RutaDAO();
        const result = await dao.validarEquipoRuteado(123);
        expect(result).toBe(false);
    });

    it('debería retornar rutas correctamente desde obtenerRutas', async () => {
        const rutasFake = [{ id: 1, ruta: 'A' }];
        (dbMock.manyOrNone as jest.Mock).mockResolvedValueOnce(rutasFake);

        const dao = new RutaDAO();
        const result = await dao.obtenerRutas('E1', 1, '2025-03-30');
        expect(result).toEqual(rutasFake);
    });
});
