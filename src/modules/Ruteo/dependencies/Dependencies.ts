import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import { IDatabase, IMain } from 'pg-promise';
import TYPESDEPENDENCIES from './TypesDependencies';
import { autorizacion } from '@infrastructure/bd';
import { EquipoVehiculoDAO } from '@infrastructure/bd/postgresql/dao/EquipoVehiculoDAO';
import { IEquipoVehiculoRepository } from '../domain/repositories/EquipoVehiculoRepository';
import { RedisClient } from 'redis';
import { RedisClientesConnection } from '@infrastructure/redis/adapter/redis';
import IEnviosRedis from '@infrastructure/redis/interfaces/IClienteRedis';
import { EnviosRedis } from '@infrastructure/redis/EnviosRedis';
import { IGotTokenApi } from '@infrastructure/client/got/autenticacion/interfaces';
import { GotTokenApi } from '@infrastructure/client/got/autenticacion/GotToken';
import { IRutaRepository } from '../domain/repositories/RutaRepository';
import { RutaDAO } from '@infrastructure/bd/postgresql/dao/RutaDAO';
import { IEnvioRepository } from '../domain/repositories/EnvioRepository';
import { EnvioDAO } from '@infrastructure/bd/postgresql/dao/EnvioDAO';
import TareaUseCase from '../useCase/TareaUseCase';
import ValidarUsuarioUseCase from '../useCase/ValidarUsuarioUseCase';
import ObtenerRutasUseCase from '../useCase/ObtenerRutasUseCase';

export const createDependencies = (): void => {
    GLOBAL_CONTAINER.bind<IDatabase<IMain>>(TYPESDEPENDENCIES.Postgresql).toConstantValue(autorizacion);
    GLOBAL_CONTAINER.bind<IEquipoVehiculoRepository>(TYPESDEPENDENCIES.IEquipoVehiculoRepository)
        .to(EquipoVehiculoDAO)
        .inSingletonScope();
    GLOBAL_CONTAINER.bind<IRutaRepository>(TYPESDEPENDENCIES.IRutaRepository).to(RutaDAO).inSingletonScope();
    GLOBAL_CONTAINER.bind<IEnvioRepository>(TYPESDEPENDENCIES.IEnvioRepository).to(EnvioDAO).inSingletonScope();

    GLOBAL_CONTAINER.bind<IGotTokenApi>(TYPESDEPENDENCIES.GotTokenApi).to(GotTokenApi).inSingletonScope();

    GLOBAL_CONTAINER.bind<ValidarUsuarioUseCase>(TYPESDEPENDENCIES.ValidarUsuarioUseCase)
        .to(ValidarUsuarioUseCase)
        .inSingletonScope();
    GLOBAL_CONTAINER.bind<ObtenerRutasUseCase>(TYPESDEPENDENCIES.ObtenerRutasUseCase)
        .to(ObtenerRutasUseCase)
        .inSingletonScope();
    GLOBAL_CONTAINER.bind<TareaUseCase>(TYPESDEPENDENCIES.TareaUseCase).to(TareaUseCase).inSingletonScope();

    GLOBAL_CONTAINER.bind<RedisClient>(TYPESDEPENDENCIES.RedisAdapter).toConstantValue(RedisClientesConnection);
    GLOBAL_CONTAINER.bind<IEnviosRedis>(TYPESDEPENDENCIES.RedisRepoCache).to(EnviosRedis).inSingletonScope();
};
