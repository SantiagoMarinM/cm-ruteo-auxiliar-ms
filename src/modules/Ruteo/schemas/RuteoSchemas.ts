import Joi from 'joi';
import { IObtenerRutasDataIn, IValidarEquipoDataIn } from '../application/data/in/IRuteoDataIn';

export const BodyValidarEquipoSchema = Joi.object<IValidarEquipoDataIn>({
    codigo_equipo: Joi.string().required(),
    terminal: Joi.number().required(),
    placa_vehiculo: Joi.string().required(),
}).unknown(true);

export const BodyConsultaRutaSchema = Joi.object<IObtenerRutasDataIn>({
    codigo_equipo: Joi.string().required(),
    terminal_equipo: Joi.number().required(),
    fecha_ruta: Joi.string().required(),
}).unknown(true);

export const ValidarTokenSchema = Joi.object({
    'x-client-id': Joi.string().required(),
    'x-request-id': Joi.string().required(),
    authorization: Joi.string().required(),
}).unknown(true);
