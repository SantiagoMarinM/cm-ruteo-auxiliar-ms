import RuteoAuxiliarModules from '@modules/Ruteo/RuteoAuxiliarModules';
import { HTTPMETODO } from '@common/modules/Ruta';

jest.mock('@modules/Ruteo/controllers/RuteoAuxiliarRouter', () => {
    return jest.fn().mockImplementation(() => ({
        validarEquipoParaRuta: jest.fn(),
        obtenerRutas: jest.fn(),
        recalcularPrioridades: jest.fn(),
        eliminarRedis: jest.fn(),
    }));
});
jest.mock('@infrastructure/redis/adapter/redis', () => {
    return {
        default: jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
        })),
    };
});

describe('RuteoAuxiliarModules', () => {
    let module: RuteoAuxiliarModules;

    beforeEach(() => {
        jest.clearAllMocks();
        module = new RuteoAuxiliarModules();
    });

    it('debería retornar la ruta base "/"', () => {
        expect(module.ruta).toBe('/');
    });

    it('debería retornar las rutas correctamente configuradas', () => {
        const rutas = module.getRutas();

        expect(rutas).toHaveLength(4);

        expect(rutas[0]).toMatchObject({
            metodo: HTTPMETODO.POST,
            url: '/usuarios/validacion',
        });

        expect(rutas[1]).toMatchObject({
            metodo: HTTPMETODO.GET,
            url: '/rutas',
        });

        expect(rutas[2]).toMatchObject({
            metodo: HTTPMETODO.PATCH,
            url: '/tarea/prioridades',
        });

        expect(rutas[3]).toMatchObject({
            metodo: HTTPMETODO.DELETE,
            url: '/redis',
        });

        // Verificamos que los handlers estén correctamente asociados
        for (const ruta of rutas) {
            expect(typeof ruta.evento).toBe('function');
        }
    });
});
