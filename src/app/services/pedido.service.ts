import { Injectable, signal } from '@angular/core';
import { Pedido, PedidoCreacion, ItemPedido, EstadoPedido } from '../models/pedido.model';
import { ProductoService } from './producto.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private pedidos = signal<Pedido[]>([]);
  private contadorOrden = signal<number>(1);
  private pedidoActual = signal<Pedido | null>(null);

  constructor(private productoService: ProductoService) {}

  getPedidos() {
    return this.pedidos.asReadonly();
  }

  getPedidoActual() {
    return this.pedidoActual.asReadonly();
  }

  getPedidoById(id: string): Pedido | undefined {
    return this.pedidos().find(p => p.id === id);
  }

  getPedidosPorEstado(estado: EstadoPedido): Pedido[] {
    return this.pedidos().filter(p => p.estado === estado);
  }

  crearPedido(pedidoData: PedidoCreacion): Pedido | null {
    if (!pedidoData.items || pedidoData.items.length === 0) {
      return null;
    }

    const items: ItemPedido[] = [];
    let subtotal = 0;

    for (const itemData of pedidoData.items) {
      const producto = this.productoService.getProductoById(itemData.productoId);
      if (!producto) continue;

      if (producto.stock < itemData.cantidad) {
        console.error(`Stock insuficiente para ${producto.nombre}`);
        return null;
      }

      const itemSubtotal = producto.precio * itemData.cantidad;
      const item: ItemPedido = {
        id: Date.now().toString() + Math.random(),
        producto: producto,
        cantidad: itemData.cantidad,
        precioUnitario: producto.precio,
        subtotal: itemSubtotal,
        notas: itemData.notas
      };

      items.push(item);
      subtotal += itemSubtotal;
    }

    const impuestos = subtotal * 0.16;
    const total = subtotal + impuestos;

    const nuevoPedido: Pedido = {
      id: Date.now().toString(),
      numeroOrden: this.contadorOrden(),
      items: items,
      subtotal: subtotal,
      impuestos: impuestos,
      total: total,
      estado: EstadoPedido.PENDIENTE,
      pagado: false,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      nombreCliente: pedidoData.nombreCliente,
      notas: pedidoData.notas
    };

    this.contadorOrden.update(n => n + 1);
    this.pedidos.update(pedidos => [...pedidos, nuevoPedido]);
    this.pedidoActual.set(nuevoPedido);

    for (const item of items) {
      this.productoService.actualizarStock(item.producto.id, -item.cantidad);
    }

    return nuevoPedido;
  }

  actualizarEstadoPedido(id: string, nuevoEstado: EstadoPedido): Pedido | null {
    const index = this.pedidos().findIndex(p => p.id === id);
    if (index === -1) return null;

    const pedidoActualizado = {
      ...this.pedidos()[index],
      estado: nuevoEstado,
      fechaActualizacion: new Date()
    };

    this.pedidos.update(pedidos => [
      ...pedidos.slice(0, index),
      pedidoActualizado,
      ...pedidos.slice(index + 1)
    ]);

    if (this.pedidoActual()?.id === id) {
      this.pedidoActual.set(pedidoActualizado);
    }

    return pedidoActualizado;
  }

  marcarComoPagado(id: string, metodoPago: string): Pedido | null {
    const index = this.pedidos().findIndex(p => p.id === id);
    if (index === -1) return null;

    const pedidoActualizado = {
      ...this.pedidos()[index],
      pagado: true,
      metodoPago: metodoPago,
      fechaActualizacion: new Date()
    };

    this.pedidos.update(pedidos => [
      ...pedidos.slice(0, index),
      pedidoActualizado,
      ...pedidos.slice(index + 1)
    ]);

    if (this.pedidoActual()?.id === id) {
      this.pedidoActual.set(pedidoActualizado);
    }

    return pedidoActualizado;
  }

  agregarItemsAPedido(pedidoId: string, nuevosItems: ItemPedido[]): Pedido | null {
    const index = this.pedidos().findIndex(p => p.id === pedidoId);
    if (index === -1) return null;

    const pedidoActual = this.pedidos()[index];
    const itemsActualizados = [...pedidoActual.items];

    // Agregar o actualizar items
    for (const nuevoItem of nuevosItems) {
      const itemExistente = itemsActualizados.find(i => i.producto.id === nuevoItem.producto.id);

      if (itemExistente) {
        // Si el producto ya existe, incrementar cantidad
        itemExistente.cantidad += nuevoItem.cantidad;
        itemExistente.subtotal = itemExistente.precioUnitario * itemExistente.cantidad;
      } else {
        // Si es un producto nuevo, agregarlo
        itemsActualizados.push(nuevoItem);
      }

      // Actualizar stock del producto
      this.productoService.actualizarStock(nuevoItem.producto.id, -nuevoItem.cantidad);
    }

    // Recalcular totales
    const subtotal = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0);
    const impuestos = subtotal * 0.16;
    const total = subtotal + impuestos;

    const pedidoActualizado = {
      ...pedidoActual,
      items: itemsActualizados,
      subtotal: subtotal,
      impuestos: impuestos,
      total: total,
      fechaActualizacion: new Date()
    };

    this.pedidos.update(pedidos => [
      ...pedidos.slice(0, index),
      pedidoActualizado,
      ...pedidos.slice(index + 1)
    ]);

    if (this.pedidoActual()?.id === pedidoId) {
      this.pedidoActual.set(pedidoActualizado);
    }

    return pedidoActualizado;
  }

  cancelarPedido(id: string): Pedido | null {
    const pedido = this.getPedidoById(id);
    if (!pedido || pedido.pagado) return null;

    for (const item of pedido.items) {
      this.productoService.actualizarStock(item.producto.id, item.cantidad);
    }

    return this.actualizarEstadoPedido(id, EstadoPedido.CANCELADO);
  }

  iniciarNuevoPedido(): void {
    this.pedidoActual.set(null);
  }

  setPedidoActual(pedido: Pedido | null): void {
    this.pedidoActual.set(pedido);
  }

  getTotalVentasHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.pedidos()
      .filter(p => p.pagado && p.fechaCreacion >= hoy)
      .reduce((total, p) => total + p.total, 0);
  }

  getCantidadPedidosHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.pedidos()
      .filter(p => p.fechaCreacion >= hoy)
      .length;
  }
}
