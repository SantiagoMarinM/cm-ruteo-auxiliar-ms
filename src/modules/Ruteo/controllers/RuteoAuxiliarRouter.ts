import { Response, ResponseMethod } from '@common/http/Response';
import { JsonValidator } from '@modules/shared/config/schemas';
import { GLOBAL_CONTAINER } from '@common/dependencies/DependencyContainer';
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies';
import IEnviosRedis from '@infrastructure/redis/interfaces/IClienteRedis';

import { injectable } from 'inversify';
import { CustomRequest, IObtenerRutasDataIn, IValidarEquipoDataIn } from '../application/data/in/IRuteoDataIn';
import TareaUseCase from '../useCase/TareaUseCase';
import ValidarUsuarioUseCase from '../useCase/ValidarUsuarioUseCase';
import ObtenerRutasUseCase from '../useCase/ObtenerRutasUseCase';
import { IObtenerRuteoCompleto } from '@infrastructure/bd/interfaces/IObtenerRutas';
import { BodyConsultaRutaSchema, BodyValidarEquipoSchema, ValidarTokenSchema } from '../schemas';
import Result from '@common/http/Result';

@injectable()
export default class RuteoAuxiliarRouter {
    async validarEquipoParaRuta(req: CustomRequest): Promise<Response<ResponseMethod<string>>> {
        const headers = req.headers as Record<string, string>;
        const logger = req.logData;
        const body = req.data as IValidarEquipoDataIn;
        new JsonValidator().validate(BodyValidarEquipoSchema, body);
        new JsonValidator().validate(ValidarTokenSchema, headers);
        const token = headers.authorization.replace(/^Bearer\s+/i, '');
        const inicioRuteo = GLOBAL_CONTAINER.get<ValidarUsuarioUseCase>(TYPESDEPENDENCIES.ValidarUsuarioUseCase);
        try {
            const resultado = await inicioRuteo.execute(body, headers, token, logger);
            return Result.ok({ data: resultado, message: 'Ruta asignada' });
        } catch (error) {
            return Result.failure(error, 501);
        }
    }

    async obtenerRutas(req: CustomRequest): Promise<Response<ResponseMethod<IObtenerRuteoCompleto[] | null | void>>> {
        const logger = req.logData;
        const body = req.data as IObtenerRutasDataIn;
        new JsonValidator().validate(BodyConsultaRutaSchema, body);
        const obtenerRutasUseCase = GLOBAL_CONTAINER.get<ObtenerRutasUseCase>(TYPESDEPENDENCIES.ObtenerRutasUseCase);
        try {
            const response = await obtenerRutasUseCase.execute(body, logger);
            return Result.ok({ data: response, message: 'Rutas obtenidas correctamente' });
        } catch (error) {
            return Result.failure(error);
        }
    }

    async recalcularPrioridades(req: CustomRequest): Promise<Response<ResponseMethod<string | void>>> {
        const logger = req.logData;
        try {
            const tareaUseCase = GLOBAL_CONTAINER.get<TareaUseCase>(TYPESDEPENDENCIES.TareaUseCase);
            const resultado = await tareaUseCase.execute(logger);
            return Result.ok({ data: resultado, message: 'Prioridades recalculadas correctamente' });
        } catch (error) {
            return Result.failure(error);
        }
    }
    async eliminarRedis(): Promise<Response<ResponseMethod<null>>> {
        const redis = GLOBAL_CONTAINER.get<IEnviosRedis>(TYPESDEPENDENCIES.RedisRepoCache);
        await redis.flushAll();
        return Result.ok({ data: null, message: 'Datos eliminados exitosamente' });
    }
}
