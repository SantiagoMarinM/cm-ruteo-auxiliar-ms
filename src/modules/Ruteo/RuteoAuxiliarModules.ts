import { IModule } from '@common/modules/IModule';
import { HTTPMETODO, Ruta } from '@common/modules/Ruta';
import RuteoAuxiliarRouter from './controllers/RuteoAuxiliarRouter';
import createDependencyContainer from '@common/dependencies/DependencyContainer';
import { createDependencies } from './dependencies/Dependencies';

export default class RuteoAuxiliarModules implements IModule {
    private readonly moduloRuta = '/';
    private readonly controller = new RuteoAuxiliarRouter();

    constructor() {
        createDependencies();
        createDependencyContainer();
    }

    getRutas = (): Ruta[] => {
        return [
            {
                metodo: HTTPMETODO.POST,
                url: '/usuarios/validacion',
                evento: this.controller.validarEquipoParaRuta.bind(this.controller),
            },
            {
                metodo: HTTPMETODO.GET,
                url: '/rutas',
                evento: this.controller.obtenerRutas.bind(this.controller),
            },
            {
                metodo: HTTPMETODO.PATCH,
                url: '/tarea/prioridades',
                evento: this.controller.recalcularPrioridades.bind(this.controller),
            },
            {
                metodo: HTTPMETODO.DELETE,
                url: '/redis',
                evento: this.controller.eliminarRedis.bind(this.controller),
            },
        ];
    };

    get ruta(): string {
        return this.moduloRuta;
    }
}
