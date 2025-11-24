export interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  ubicacion: UbicacionMesa;
  estado: EstadoMesa;
  activa: boolean;
}

export enum UbicacionMesa {
  INTERIOR = 'INTERIOR',
  TERRAZA = 'TERRAZA',
  VENTANA = 'VENTANA',
  PRIVADO = 'PRIVADO'
}

export enum EstadoMesa {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADA = 'OCUPADA',
  RESERVADA = 'RESERVADA',
  MANTENIMIENTO = 'MANTENIMIENTO'
}

export interface MesaCreacion {
  numero: number;
  capacidad: number;
  ubicacion: UbicacionMesa;
}