import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { PagoService } from '../../services/pago.service';
import { Pedido, EstadoPedido } from '../../models/pedido.model';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent {
  private pedidoService = inject(PedidoService);
  private pagoService = inject(PagoService);

  pedidos = this.pedidoService.getPedidos();
  estadoFiltro = signal<EstadoPedido | 'TODOS'>('TODOS');
  pedidoSeleccionado = signal<Pedido | null>(null);

  EstadoPedido = EstadoPedido;

  pedidosFiltrados = computed(() => {
    const pedidos = this.pedidos();
    if (this.estadoFiltro() === 'TODOS') {
      return pedidos;
    }
    return pedidos.filter(p => p.estado === this.estadoFiltro());
  });

  estados = [
    { id: 'TODOS', nombre: 'Todos', color: '#95a5a6' },
    { id: EstadoPedido.PENDIENTE, nombre: 'Pendiente', color: '#f39c12' },
    { id: EstadoPedido.EN_PREPARACION, nombre: 'En Preparación', color: '#3498db' },
    { id: EstadoPedido.LISTO, nombre: 'Listo', color: '#27ae60' },
    { id: EstadoPedido.ENTREGADO, nombre: 'Entregado', color: '#2ecc71' },
    { id: EstadoPedido.CANCELADO, nombre: 'Cancelado', color: '#e74c3c' }
  ];

  seleccionarEstado(estado: EstadoPedido | 'TODOS'): void {
    this.estadoFiltro.set(estado);
  }

  verDetalle(pedido: Pedido): void {
    this.pedidoSeleccionado.set(pedido);
  }

  cerrarDetalle(): void {
    this.pedidoSeleccionado.set(null);
  }

  cambiarEstado(pedidoId: string, nuevoEstado: EstadoPedido): void {
    this.pedidoService.actualizarEstadoPedido(pedidoId, nuevoEstado);
    const pedidoActual = this.pedidoSeleccionado();
    if (pedidoActual && pedidoActual.id === pedidoId) {
      const pedidoActualizado = this.pedidoService.getPedidoById(pedidoId);
      if (pedidoActualizado) {
        this.pedidoSeleccionado.set(pedidoActualizado);
      }
    }
  }

  cancelarPedido(pedidoId: string): void {
    if (confirm('¿Estás seguro de cancelar este pedido?')) {
      this.pedidoService.cancelarPedido(pedidoId);
      this.cerrarDetalle();
    }
  }

  getNombreEstado(estado: EstadoPedido): string {
    const est = this.estados.find(e => e.id === estado);
    return est?.nombre || estado;
  }

  getColorEstado(estado: EstadoPedido): string {
    const est = this.estados.find(e => e.id === estado);
    return est?.color || '#95a5a6';
  }

  getTotalPedidosHoy(): number {
    return this.pedidoService.getCantidadPedidosHoy();
  }

  getTotalVentasHoy(): number {
    return this.pedidoService.getTotalVentasHoy();
  }

  getPedidosPendientes(): number {
    return this.pedidos().filter(p => p.estado === EstadoPedido.PENDIENTE).length;
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
