import { IUsuariosVehiculos } from '@infrastructure/bd/interfaces/IUsuariosVehiculos';

export interface IEquipoVehiculoRepository {
    obtener(equipo: string, terminal: number, placa: string): Promise<IUsuariosVehiculos | null>;
}
