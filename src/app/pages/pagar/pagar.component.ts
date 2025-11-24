import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignacionService } from '../../services/asignacion.service';
import { PedidoService } from '../../services/pedido.service';
import { PagoService } from '../../services/pago.service';
import { Asignacion, EstadoAsignacion } from '../../models/asignacion.model';
import { Pedido } from '../../models/pedido.model';
import { MetodoPago } from '../../models/pago.model';

@Component({
  selector: 'app-pagar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagar.component.html',
  styleUrls: ['./pagar.component.scss']
})
export class PagarComponent {
  private asignacionService = inject(AsignacionService);
  private pedidoService = inject(PedidoService);
  private pagoService = inject(PagoService);

  private asignaciones = this.asignacionService.getAsignaciones();

  MetodoPago = MetodoPago;
  EstadoAsignacion = EstadoAsignacion;

  asignacionSeleccionadaId = signal<string | null>(null);
  formularioPago = signal({
    metodoPago: MetodoPago.EFECTIVO,
    montoPagado: 0
  });

  pagosPendientes = computed(() => {
    const asignaciones = this.asignaciones();

    return asignaciones
      .filter(asignacion =>
        !!asignacion.pedidoId &&
        [EstadoAsignacion.ACTIVA, EstadoAsignacion.ATENDIDA].includes(asignacion.estado)
      )
      .map(asignacion => ({
        asignacion,
        pedido: asignacion.pedidoId
          ? this.pedidoService.getPedidoById(asignacion.pedidoId)
          : undefined
      }))
      .filter(
        (item): item is { asignacion: Asignacion; pedido: Pedido } =>
          item.pedido !== undefined && item.pedido !== null && !item.pedido.pagado
      );
  });

  asignacionSeleccionada = computed(() => {
    const id = this.asignacionSeleccionadaId();
    if (!id) return null;
    return this.asignacionService.getAsignacionById(id) ?? null;
  });

  pedidoSeleccionado = computed(() => {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion?.pedidoId) return null;
    return this.pedidoService.getPedidoById(asignacion.pedidoId) ?? null;
  });

  metodosPago = [
    { id: MetodoPago.EFECTIVO, nombre: 'Efectivo', icono: '💵' },
    { id: MetodoPago.TARJETA_DEBITO, nombre: 'Débito', icono: '💳' },
    { id: MetodoPago.TARJETA_CREDITO, nombre: 'Crédito', icono: '💳' },
    { id: MetodoPago.TRANSFERENCIA, nombre: 'Transferencia', icono: '🏦' },
    { id: MetodoPago.QR, nombre: 'QR', icono: '📱' }
  ];

  cantidadesRapidas = [50, 100, 200, 500, 1000];

  seleccionarPago(asignacionId: string): void {
    this.asignacionSeleccionadaId.set(asignacionId);
    const pedido = this.pedidoSeleccionado();
    if (pedido) {
      const metodoActual = this.formularioPago().metodoPago;
      this.formularioPago.set({
        metodoPago: metodoActual,
        montoPagado: pedido.total
      });
    }
  }

  actualizarMetodoPago(metodo: MetodoPago | string): void {
    this.formularioPago.update(form => ({
      ...form,
      metodoPago: metodo as MetodoPago
    }));
  }

  actualizarMontoPagado(monto: number | string): void {
    this.formularioPago.update(form => ({
      ...form,
      montoPagado: Number(monto) || 0
    }));
  }

  agregarMonto(cantidad: number): void {
    const montoActual = this.formularioPago().montoPagado;
    this.formularioPago.update(form => ({
      ...form,
      montoPagado: montoActual + cantidad
    }));
  }

  establecerMontoExacto(): void {
    const pedido = this.pedidoSeleccionado();
    if (pedido) {
      this.formularioPago.update(form => ({
        ...form,
        montoPagado: pedido.total
      }));
    }
  }

  limpiarMonto(): void {
    this.formularioPago.update(form => ({
      ...form,
      montoPagado: 0
    }));
  }

  procesarPago(): void {
    const asignacion = this.asignacionSeleccionada();
    const pedido = this.pedidoSeleccionado();
    const form = this.formularioPago();

    if (!asignacion || !pedido) {
      alert('Selecciona un pedido para pagar');
      return;
    }

    if (pedido.pagado) {
      alert('Este pedido ya fue pagado');
      return;
    }

    if (form.montoPagado < pedido.total) {
      alert('El monto pagado no puede ser menor al total');
      return;
    }

    const pago = this.pagoService.procesarPago({
      pedidoId: pedido.id,
      metodoPago: form.metodoPago,
      montoPagado: form.montoPagado
    });

    if (!pago) {
      alert('No se pudo procesar el pago. Intenta nuevamente.');
      return;
    }

    this.asignacionService.finalizarAsignacion(asignacion.id);

    alert(`Pago registrado correctamente. Cambio entregado: $${pago.cambio.toFixed(2)}`);

    this.asignacionSeleccionadaId.set(null);
    this.formularioPago.set({
      metodoPago: MetodoPago.EFECTIVO,
      montoPagado: 0
    });
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
