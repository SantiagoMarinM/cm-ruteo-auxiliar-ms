const TYPESDEPENDENCIES = {
    Postgresql: Symbol.for('Postgresql'),
    IEquipoVehiculoRepository: Symbol.for('IEquipoVehiculoRepository'),
    IRutaRepository: Symbol.for('IRutaRepository'),
    IEnvioRepository: Symbol.for('IEnvioRepository'),
    GotTokenApi: Symbol.for('GotTokenApi'),
    ValidarIdClienteUseCase: Symbol.for('ValidarIdClienteUseCase'),
    RedisAdapter: Symbol.for('RedisAdapter'),
    RedisRepoCache: Symbol.for('RedisRepoCache'),
    RutearUseCase: Symbol.for('RutearUseCase'),
    ValidarUsuarioUseCase: Symbol.for('ValidarUsuarioUseCase'),
    ObtenerRutasUseCase: Symbol.for('ObtenerRutasUseCase'),
    ValidarTokenUseCase: Symbol.for('ValidarTokenUseCase'),
    TareaUseCase: Symbol.for('TareaUseCase'),
};

export default TYPESDEPENDENCIES;
