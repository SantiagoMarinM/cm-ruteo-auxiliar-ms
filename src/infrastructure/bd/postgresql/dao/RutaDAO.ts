import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { PostgresError, UNAUTHORIZED } from '@common/http/exceptions';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { injectable } from 'inversify';
import { IDatabase, IMain, as } from 'pg-promise';
import { obtenerRutas, validarEquipoYaRuteado } from './querys/RuteoQueries';
import { IRutaRepository } from '@modules/Ruteo/domain/repositories/RutaRepository';
import { IObtenerRuteoCompleto } from '@infrastructure/bd/interfaces/IObtenerRutas';

@injectable()
export class RutaDAO implements IRutaRepository {
    private readonly db = GLOBAL_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql);

    async validarEquipoRuteado(id_equipo_vehiculo: number): Promise<boolean> {
        try {
            const query = as.format(validarEquipoYaRuteado, [id_equipo_vehiculo]);
            const response = await this.db.oneOrNone(query);
            return response ? true : false;
        } catch (error) {
            console.log(error);
            throw new UNAUTHORIZED('Error al validar si el equipo ya ruteó', '500', error.message);
        }
    }
    async obtenerRutas(
        codigo_equipo: string,
        terminal: number,
        fecha_ruta: string,
    ): Promise<IObtenerRuteoCompleto[] | null> {
        try {
            const query = as.format(obtenerRutas, [codigo_equipo, terminal, fecha_ruta]);
            const response = await this.db.manyOrNone(query);
            return response;
        } catch (error) {
            throw new PostgresError('Error al obtener rutas');
        }
    }
}
