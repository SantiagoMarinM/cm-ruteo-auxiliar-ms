import { inject, injectable } from 'inversify';
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { IValidarEquipoDataIn } from '../application/data/in/IRuteoDataIn';
import { IEquipoVehiculoRepository } from '../domain/repositories/EquipoVehiculoRepository';
import { IGotTokenApi } from '@infrastructure/client/got/autenticacion/interfaces';
import { ENV } from '@modules/shared';
import { UNAUTHORIZED } from '@common/http/exceptions';
import { IUsuariosVehiculos } from '@infrastructure/bd/interfaces/IUsuariosVehiculos';
import { IRutaRepository } from '../domain/repositories/RutaRepository';
import { TYPES } from '@common/dependencies';
import { ILogger } from '@common/logger';
import { EventsPublisher } from '@common/domain/events';
import EVENTO_RUTEO from '@infrastructure/pubsub/Topics';
import CustomError from '@common/utils/CustomError';

@injectable()
export default class ValidarUsuarioUseCase {
    private readonly equipoVehiculoRepository = GLOBAL_CONTAINER.get<IEquipoVehiculoRepository>(
        TYPESDEPENDENCIES.IEquipoVehiculoRepository,
    );
    private readonly rutaRepository = GLOBAL_CONTAINER.get<IRutaRepository>(TYPESDEPENDENCIES.IRutaRepository);
    private pubSub = GLOBAL_CONTAINER.get<EventsPublisher>(TYPES.Publisher);
    private readonly gotToken = GLOBAL_CONTAINER.get<IGotTokenApi>(TYPESDEPENDENCIES.GotTokenApi);
    constructor(@inject(TYPES.Logger) private log: ILogger) {}

    async execute(
        data: IValidarEquipoDataIn,
        headers: Record<string, string>,
        token: string,
        logData: unknown[],
    ): Promise<string> {
        try {
            this.log.add('info', 'Iniciando validación de usuarios', logData);
            const equipoVehiculo = await this.validarYObtenerEquipo(data, headers, token);
            this.pubSub.publish(EVENTO_RUTEO, { ...equipoVehiculo, terminal: data.terminal });
            this.log.add('info', 'Validacion Exitosa', logData);
            return 'Envio a ruteo exitoso';
        } catch (error) {
            throw new CustomError(error.error.message, error.code, true);
        }
    }

    private async validarYObtenerEquipo(
        data: IValidarEquipoDataIn,
        headers: Record<string, string>,
        token: string,
    ): Promise<IUsuariosVehiculos> {
        const autorizado = await this.gotToken.validarToken(ENV.URL_API_TOKEN, headers, token);
        this.validarAutorizacionToken(autorizado);

        const dataEquipoVehiculo = await this.equipoVehiculoRepository.obtener(
            data.codigo_equipo,
            data.terminal,
            data.placa_vehiculo,
        );
        this.validarAutorizacionEquipoVehiculo(dataEquipoVehiculo);

        const equipoVehiculo = dataEquipoVehiculo as IUsuariosVehiculos;
        const equipoEnRuta = await this.rutaRepository.validarEquipoRuteado(equipoVehiculo.id_equipos_vehiculos);
        this.validarEquipoEnRuta(data.codigo_equipo, equipoEnRuta);

        return equipoVehiculo;
    }

    private validarAutorizacionEquipoVehiculo(dataEquipoVehiculo: IUsuariosVehiculos | null) {
        if (!dataEquipoVehiculo || !dataEquipoVehiculo.vehiculo_activo || !dataEquipoVehiculo.equipo_activo) {
            throw new UNAUTHORIZED('Equipo no autorizado para salir a ruta', '401');
        }
    }

    private validarAutorizacionToken(tokenValido: boolean) {
        if (!tokenValido) {
            throw new UNAUTHORIZED('Token no autorizado', '401');
        }
    }

    private validarEquipoEnRuta(codigo_equipo: string, equipoEnRuta: boolean) {
        if (equipoEnRuta) {
            throw new UNAUTHORIZED(`El equipo ${codigo_equipo} ya hizo un ruteo el día de hoy`, '401');
        }
    }
}
