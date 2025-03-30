import { IDatabase } from 'pg-promise';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import CustomError from '@common/utils/CustomError';
import { EnvioDAO } from '@infrastructure/bd/postgresql/dao/EnvioDAO';
import { sincronizarEnvios } from '@infrastructure/bd/postgresql/dao/querys/RuteoQueries';

jest.mock('@infrastructure/bd/postgresql/dao/querys/RuteoQueries', () => ({
    sincronizarEnvios: 'SELECT * FROM sincronizar_envios();',
}));

describe('EnvioDAO', () => {
    const dbMock: Partial<IDatabase<unknown>> = {
        none: jest.fn(),
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

    it('debería ejecutar correctamente sincronizacionEnvios', async () => {
        const dao = new EnvioDAO();
        await expect(dao.sincronizacionEnvios()).resolves.toBeUndefined();
        expect(dbMock.none).toHaveBeenCalledWith(sincronizarEnvios);
    });

    it('debería lanzar un CustomError si la query falla', async () => {
        const dbError = new Error('DB error');
        (dbMock.none as jest.Mock).mockRejectedValueOnce(dbError);

        const dao = new EnvioDAO();
        const promise = dao.sincronizacionEnvios();

        await expect(promise).rejects.toThrow(CustomError);
        await expect(promise).rejects.toMatchObject({
            message: 'Error al guardar ruta',
        });
    });
});
