import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { injectable } from 'inversify';
import { IDatabase, IMain, as } from 'pg-promise';
import { sincronizarEnvios } from './querys/RuteoQueries';
import { IEnvioRepository } from '@modules/Ruteo/domain/repositories/EnvioRepository';
import CustomError from '@common/utils/CustomError';

@injectable()
export class EnvioDAO implements IEnvioRepository {
    private readonly db = GLOBAL_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql);

    async sincronizacionEnvios(): Promise<void> {
        try {
            const query = as.format(sincronizarEnvios);
            await this.db.none(query);
        } catch (error) {
            throw new CustomError('Error al guardar ruta', error.message);
        }
    }
}
