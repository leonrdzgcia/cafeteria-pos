import { Mesa } from './mesa.model';

export interface Asignacion {
  id: string;
  numeroOrden: number;
  mesa: Mesa;
  nombreCliente: string;
  numeroPersonas: number;
  numeroAdultos: number;
  numeroNinos: number;
  estado: EstadoAsignacion;
  fechaAsignacion: Date;
  fechaLiberacion?: Date;
  notas?: string;
  pedidoId?: string;
}

export enum EstadoAsignacion {
  ACTIVA = 'ACTIVA',
  ATENDIDA = 'ATENDIDA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA'
}

export interface AsignacionCreacion {
  mesaId: string;
  nombreCliente: string;
  numeroPersonas: number;
  numeroAdultos: number;
  numeroNinos: number;
  notas?: string;
}