import 'module-alias/register';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { TYPESSERVER } from '@infrastructure/app/server/TypeServer';
import ModulesFactory from '@common/modules/ModulesFactory';
import RuteoAuxiliarModules from '@modules/Ruteo/RuteoAuxiliarModules';

dotenv.config();

async function bootstrap() {
    const modulesFactory = new ModulesFactory();
    const server = modulesFactory.createServer(TYPESSERVER.Fastify);
    modulesFactory.initModules([RuteoAuxiliarModules]);
    server?.start();
}
bootstrap();
