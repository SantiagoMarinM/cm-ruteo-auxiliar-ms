import { IObtenerRuteoCompleto } from '@infrastructure/bd/interfaces/IObtenerRutas';

export interface IRutaRepository {
    validarEquipoRuteado(id_equipo_vehiculo: number): Promise<boolean>;
    obtenerRutas(codigo_equipo: string, terminal: number, fecha_ruta: string): Promise<IObtenerRuteoCompleto[] | null>;
}
