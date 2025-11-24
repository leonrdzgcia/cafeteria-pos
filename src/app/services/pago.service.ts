import { Injectable, signal } from '@angular/core';
import { Pago, PagoCreacion, MetodoPago, EstadoPago } from '../models/pago.model';
import { PedidoService } from './pedido.service';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private pagos = signal<Pago[]>([]);

  constructor(private pedidoService: PedidoService) {}

  getPagos() {
    return this.pagos.asReadonly();
  }

  getPagoById(id: string): Pago | undefined {
    return this.pagos().find(p => p.id === id);
  }

  getPagosPorPedido(pedidoId: string): Pago[] {
    return this.pagos().filter(p => p.pedidoId === pedidoId);
  }

  procesarPago(pagoData: PagoCreacion): Pago | null {
    const pedido = this.pedidoService.getPedidoById(pagoData.pedidoId);
    if (!pedido) {
      console.error('Pedido no encontrado');
      return null;
    }

    if (pedido.pagado) {
      console.error('Pedido ya está pagado');
      return null;
    }

    if (pagoData.montoPagado < pedido.total) {
      console.error('Monto insuficiente');
      return null;
    }

    const cambio = pagoData.montoPagado - pedido.total;

    const nuevoPago: Pago = {
      id: Date.now().toString(),
      pedidoId: pagoData.pedidoId,
      monto: pedido.total,
      metodoPago: pagoData.metodoPago,
      estado: EstadoPago.COMPLETADO,
      fechaPago: new Date(),
      montoPagado: pagoData.montoPagado,
      cambio: cambio,
      referencia: this.generarReferencia(pagoData.metodoPago)
    };

    this.pagos.update(pagos => [...pagos, nuevoPago]);

    this.pedidoService.marcarComoPagado(
      pagoData.pedidoId,
      this.getNombreMetodoPago(pagoData.metodoPago)
    );

    return nuevoPago;
  }

  private generarReferencia(metodoPago: MetodoPago): string {
    const timestamp = Date.now();
    const prefijo = metodoPago.substring(0, 3).toUpperCase();
    const numero = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefijo}-${timestamp}-${numero}`;
  }

  getNombreMetodoPago(metodo: MetodoPago): string {
    const nombres: Record<MetodoPago, string> = {
      [MetodoPago.EFECTIVO]: 'Efectivo',
      [MetodoPago.TARJETA_DEBITO]: 'Tarjeta de Débito',
      [MetodoPago.TARJETA_CREDITO]: 'Tarjeta de Crédito',
      [MetodoPago.TRANSFERENCIA]: 'Transferencia',
      [MetodoPago.QR]: 'Código QR'
    };
    return nombres[metodo];
  }

  getTotalPagosPorMetodo(metodoPago: MetodoPago): number {
    return this.pagos()
      .filter(p => p.metodoPago === metodoPago && p.estado === EstadoPago.COMPLETADO)
      .reduce((total, p) => total + p.monto, 0);
  }

  getTotalPagosHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.pagos()
      .filter(p => p.estado === EstadoPago.COMPLETADO && p.fechaPago >= hoy)
      .reduce((total, p) => total + p.monto, 0);
  }

  getCantidadPagosHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.pagos()
      .filter(p => p.estado === EstadoPago.COMPLETADO && p.fechaPago >= hoy)
      .length;
  }

  getEstadisticasPorMetodoPago(): { metodo: string; total: number; cantidad: number }[] {
    const estadisticas = new Map<MetodoPago, { total: number; cantidad: number }>();

    this.pagos()
      .filter(p => p.estado === EstadoPago.COMPLETADO)
      .forEach(pago => {
        const stats = estadisticas.get(pago.metodoPago) || { total: 0, cantidad: 0 };
        stats.total += pago.monto;
        stats.cantidad += 1;
        estadisticas.set(pago.metodoPago, stats);
      });

    return Array.from(estadisticas.entries()).map(([metodo, stats]) => ({
      metodo: this.getNombreMetodoPago(metodo),
      total: stats.total,
      cantidad: stats.cantidad
    }));
  }
}
