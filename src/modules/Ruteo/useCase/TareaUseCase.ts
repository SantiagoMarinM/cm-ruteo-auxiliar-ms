import { inject, injectable } from 'inversify';
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import IEnviosRedis from '@infrastructure/redis/interfaces/IClienteRedis';
import { IEnvioRepository } from '../domain/repositories/EnvioRepository';
import { TYPES } from '@common/dependencies';
import { ILogger } from '@common/logger';

@injectable()
export default class TareaUseCase {
    private readonly envioRepository = GLOBAL_CONTAINER.get<IEnvioRepository>(TYPESDEPENDENCIES.IEnvioRepository);
    private readonly redis = GLOBAL_CONTAINER.get<IEnviosRedis>(TYPESDEPENDENCIES.RedisRepoCache);
    constructor(@inject(TYPES.Logger) private log: ILogger) {}

    async execute(logData: unknown[]): Promise<string | void> {
        this.log.add('info', 'Iniciando sincronización de prioridades', logData);
        await this.envioRepository.sincronizacionEnvios();

        const prioridad1 = (await this.redis.obtenerEnvioPorPrioridad('envios_ruteo_1')) ?? [];
        const prioridad2 = (await this.redis.obtenerEnvioPorPrioridad('envios_ruteo_2')) ?? [];
        const prioridad3 = (await this.redis.obtenerEnvioPorPrioridad('envios_ruteo_3')) ?? [];

        const todosEnvios = [...prioridad1, ...prioridad2, ...prioridad3];

        const fechaActual = new Date();
        const unDiaDespues = new Date(fechaActual.getTime() + 24 * 60 * 60 * 1000);
        const dosDiasDespues = new Date(fechaActual.getTime() + 48 * 60 * 60 * 1000);

        const enviosConPrioridadActualizada = todosEnvios.map((envio) => {
            const fechaLimite = new Date(envio.fecha_limite_entrega);
            let nuevaPrioridad: number;

            if (fechaLimite < unDiaDespues) {
                nuevaPrioridad = 1;
            } else if (fechaLimite < dosDiasDespues) {
                nuevaPrioridad = 2;
            } else {
                nuevaPrioridad = 3;
            }

            return { ...envio, prioridad: nuevaPrioridad };
        });

        const prioridad1Actualizada = enviosConPrioridadActualizada.filter((envio) => envio.prioridad === 1);
        const prioridad2Actualizada = enviosConPrioridadActualizada.filter((envio) => envio.prioridad === 2);
        const prioridad3Actualizada = enviosConPrioridadActualizada.filter((envio) => envio.prioridad === 3);

        await this.redis.guardarRegistrosEnRedis('envios_ruteo_1', prioridad1Actualizada);
        await this.redis.guardarRegistrosEnRedis('envios_ruteo_2', prioridad2Actualizada);
        await this.redis.guardarRegistrosEnRedis('envios_ruteo_3', prioridad3Actualizada);

        this.log.add('info', 'Sincronización de prioridades exitosa', logData);
        return 'Sincronización de prioridades exitosa';
    }
}
