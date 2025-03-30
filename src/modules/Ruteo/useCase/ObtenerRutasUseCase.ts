import { inject, injectable } from 'inversify';
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { IObtenerRutasDataIn } from '../application/data/in/IRuteoDataIn';
import { IRutaRepository } from '../domain/repositories/RutaRepository';
import { TYPES } from '@common/dependencies';
import { ILogger } from '@common/logger';
import CustomError from '@common/utils/CustomError';
import { IObtenerRuteoCompleto } from '@infrastructure/bd/interfaces/IObtenerRutas';

@injectable()
export default class ObtenerRutasUseCase {
    private readonly rutaRepository = GLOBAL_CONTAINER.get<IRutaRepository>(TYPESDEPENDENCIES.IRutaRepository);
    constructor(@inject(TYPES.Logger) private log: ILogger) {}

    async execute(data: IObtenerRutasDataIn, logData: unknown[]): Promise<IObtenerRuteoCompleto[] | null> {
        try {
            this.log.add('info', 'Obteniendo rutas', logData);
            const rutas = await this.rutaRepository.obtenerRutas(
                data.codigo_equipo,
                data.terminal_equipo,
                data.fecha_ruta,
            );
            return rutas;
        } catch (error) {
            throw new CustomError(error.message, error.code, true);
        }
    }
}
