import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { AsignacionService } from '../../services/asignacion.service';

import { EstadoAsignacion } from '../../models/asignacion.model';
import { ItemPedido, ItemPedidoCreacion } from '../../models/pedido.model';
import { CategoriaProducto, Producto } from '../../models/producto.model';


interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  notas?: string;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent {
  private productoService = inject(ProductoService);
  private pedidoService = inject(PedidoService);
  private asignacionService = inject(AsignacionService);

  productos = this.productoService.getProductos();
  categoriaActual = signal<CategoriaProducto | 'TODOS'>('TODOS');
  carrito = signal<ItemCarrito[]>([]);
  asignacionSeleccionada = signal<string | null>(null);
  busqueda = signal<string>('');

  CategoriaProducto = CategoriaProducto;
  EstadoAsignacion = EstadoAsignacion;

  // Obtener asignaciones activas (mesas ocupadas listas para recibir pedidos)
  asignacionesActivas = computed(() =>
    this.asignacionService.getAsignacionesActivas()
  );

  productosFiltrados = computed(() => {
    let productos = this.productos();

    if (this.busqueda()) {
      const termino = this.busqueda().toLowerCase();
      productos = productos.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino)
      );
    }

    if (this.categoriaActual() !== 'TODOS') {
      productos = productos.filter(p => p.categoria === this.categoriaActual());
    }

    return productos.filter(p => p.activo);
  });

  subtotal = computed(() =>
    this.carrito().reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0)
  );

  impuestos = computed(() => this.subtotal() * 0.16);

  total = computed(() => this.subtotal() + this.impuestos());

  asignacionActual = computed(() => {
    const asignacionId = this.asignacionSeleccionada();
    if (!asignacionId) return null;
    return this.asignacionService.getAsignacionById(asignacionId);
  });

  // Obtener el pedido existente de la mesa seleccionada (si existe)
  pedidoExistente = computed(() => {
    const asignacion = this.asignacionActual();
    if (!asignacion || !asignacion.pedidoId) return null;
    return this.pedidoService.getPedidoById(asignacion.pedidoId);
  });

  categorias = [
    { id: 'TODOS', nombre: 'Todos' },
    { id: CategoriaProducto.BEBIDA_CALIENTE, nombre: 'Bebidas Calientes' },
    { id: CategoriaProducto.BEBIDA_FRIA, nombre: 'Bebidas Frías' },
    { id: CategoriaProducto.REPOSTERIA, nombre: 'Repostería' },
    { id: CategoriaProducto.SANDWICH, nombre: 'Sándwiches' },
    { id: CategoriaProducto.ENSALADA, nombre: 'Ensaladas' },
    { id: CategoriaProducto.OTROS, nombre: 'Otros' }
  ];

  seleccionarCategoria(categoria: CategoriaProducto | 'TODOS'): void {
    this.categoriaActual.set(categoria);
  }

  seleccionarAsignacion(asignacionId: string): void {
    this.asignacionSeleccionada.set(asignacionId);
  }

  agregarAlCarrito(producto: Producto): void {
    if (!this.asignacionSeleccionada()) {
      alert('Primero selecciona una mesa');
      return;
    }

    if (producto.stock <= 0) {
      alert('Producto sin stock disponible');
      return;
    }

    const carritoActual = this.carrito();
    const itemExistente = carritoActual.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stock) {
        alert('No hay más stock disponible');
        return;
      }
      this.carrito.set(
        carritoActual.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      this.carrito.update(items => [...items, { producto, cantidad: 1 }]);
    }
  }

  removerDelCarrito(productoId: string): void {
    this.carrito.update(items => items.filter(item => item.producto.id !== productoId));
  }

  actualizarCantidad(productoId: string, cantidad: number): void {
    const carritoActual = this.carrito();
    const item = carritoActual.find(i => i.producto.id === productoId);

    if (!item) return;

    if (cantidad <= 0) {
      this.removerDelCarrito(productoId);
      return;
    }

    if (cantidad > item.producto.stock) {
      alert('Cantidad excede el stock disponible');
      return;
    }

    this.carrito.set(
      carritoActual.map(i =>
        i.producto.id === productoId
          ? { ...i, cantidad }
          : i
      )
    );
  }

  limpiarCarrito(): void {
    this.carrito.set([]);
    this.busqueda.set('');
  }

  enviarPedidoAMesa(): void {
    if (!this.asignacionSeleccionada()) {
      alert('Selecciona una mesa');
      return;
    }

    if (this.carrito().length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const asignacion = this.asignacionActual();
    if (!asignacion) {
      alert('No se encontró la asignación');
      return;
    }

    const pedidoActual = this.pedidoExistente();

    // Si ya existe un pedido para esta mesa, agregar items
    if (pedidoActual) {
      const nuevosItems: ItemPedido[] = this.carrito().map(item => ({
        id: Date.now().toString() + Math.random(),
        producto: item.producto,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        subtotal: item.producto.precio * item.cantidad,
        notas: item.notas
      }));

      const pedidoActualizado = this.pedidoService.agregarItemsAPedido(pedidoActual.id, nuevosItems);

      if (!pedidoActualizado) {
        alert('Error al actualizar el pedido');
        return;
      }

      alert(`Pedido #${pedidoActualizado.numeroOrden} actualizado exitosamente\nMesa: ${asignacion.mesa.numero}\nCliente: ${asignacion.nombreCliente}\nTotal: $${pedidoActualizado.total.toFixed(2)}`);
      this.limpiarCarrito();
    } else {
      // Si no existe pedido, crear uno nuevo
      const items: ItemPedidoCreacion[] = this.carrito().map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        notas: item.notas
      }));

      const pedido = this.pedidoService.crearPedido({
        items,
        nombreCliente: asignacion.nombreCliente
      });

      if (!pedido) {
        alert('Error al crear el pedido');
        return;
      }

      // Vincular el pedido a la asignación
      this.asignacionService.vincularPedido(asignacion.id, pedido.id);

      alert(`Pedido #${pedido.numeroOrden} creado exitosamente\nMesa: ${asignacion.mesa.numero}\nCliente: ${asignacion.nombreCliente}\nTotal: $${pedido.total.toFixed(2)}`);
      this.limpiarCarrito();
    }
  }
}
