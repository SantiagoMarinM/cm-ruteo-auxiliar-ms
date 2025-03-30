export const obtenerVehiculoyEquipo = `select 
ev.id as id_equipos_vehiculos, ev.id_equipo, ev.id_vehiculo, 
v.capacidad_peso, v.capacidad_volumen, v.activo as vehiculo_activo, v.placa_vehiculo,
e.activo as equipo_activo, e.latitud_actual, e.longitud_actual
from santiago.equipos_vehiculos ev
join santiago.vehiculos v on ev.id_vehiculo = v.id
join santiago.equipos e on ev.id_vehiculo = e.id
where e.codigo = $1
and v.placa_vehiculo  = $3
and e.terminal = $2`;

export const consultarIdRutaEnvio = `SELECT re.id FROM santiago.rutas_envios re 
JOIN santiago.envios e ON re.id_envio = e.id WHERE e.etiqueta1d = $1`;

export const obtenerRutas = `select re.orden, e.etiqueta1d, e.latitud, e.longitud, re.id_evento_inesperado, ei.nombre  from santiago.rutas_envios re
join santiago.envios e  on re.id_envio = e.id
join santiago.rutas r on re.id_ruta = r.id
join santiago.equipos_vehiculos ev on r.id_equipo_vehiculo = ev.id
join santiago.equipos eq on ev.id_equipo = eq.id
left join santiago.eventos_inesperados ei on ei.id = re.id_evento_inesperado  
where eq.codigo = $1 and eq.terminal = $2 and r.fecha_ruta = $3
order by re.orden asc`;

export const validarEquipoYaRuteado = `SELECT 1 FROM santiago.rutas where id_equipo_vehiculo = $1 and fecha_ruta = current_date`;

export const sincronizarEnvios = `UPDATE santiago.envios SET ultima_actualizacion = now() WHERE estado = 1`;
