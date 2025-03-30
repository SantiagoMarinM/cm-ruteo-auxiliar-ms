export interface IValidarEquipoDataIn {
    codigo_equipo: string;
    terminal: number;
    placa_vehiculo: string;
}

export interface CustomRequest {
    data: IValidarEquipoDataIn | IObtenerRutasDataIn | Record<string, unknown>;
    headers: {
        authorization: string;
        'x-client-id': string;
        'x-request-id': string;
        [key: string]: string;
    };
    logData: unknown[];
}

export interface IObtenerRutasDataIn {
    codigo_equipo: string;
    terminal_equipo: number;
    fecha_ruta: string;
}
