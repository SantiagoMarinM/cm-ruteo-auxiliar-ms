import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { UNAUTHORIZED } from '@common/http/exceptions';
import TYPESDEPENDENCIES from '@modules/Ruteo/dependencies/TypesDependencies';
import { IEquipoVehiculoRepository } from '@modules/Ruteo/domain/repositories/EquipoVehiculoRepository';
import { injectable } from 'inversify';
import { IDatabase, IMain, as } from 'pg-promise';
import { obtenerVehiculoyEquipo } from './querys/RuteoQueries';
import { IUsuariosVehiculos } from '@infrastructure/bd/interfaces/IUsuariosVehiculos';

@injectable()
export class EquipoVehiculoDAO implements IEquipoVehiculoRepository {
    private readonly db = GLOBAL_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql);

    async obtener(equipo: string, terminal: number, placa: string): Promise<IUsuariosVehiculos | null> {
        try {
            const query = as.format(obtenerVehiculoyEquipo, [equipo, terminal, placa]);
            const resultado: IUsuariosVehiculos | null = await this.db.oneOrNone(query);
            return resultado;
        } catch (error) {
            throw new UNAUTHORIZED('Error al consultar equipo vehículo', '500', error.message);
        }
    }
}
