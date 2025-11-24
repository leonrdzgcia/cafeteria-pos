export interface Pago {
  id: string;
  pedidoId: string;
  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  fechaPago: Date;
  referencia?: string;
  montoPagado: number;
  cambio: number;
}

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  QR = 'QR'
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO'
}

export interface PagoCreacion {
  pedidoId: string;
  metodoPago: MetodoPago;
  montoPagado: number;
}
