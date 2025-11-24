import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto, ProductoCreacion, CategoriaProducto } from '../../models/producto.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {
  private productoService = inject(ProductoService);

  productos = this.productoService.getProductos();
  mostrarModal = signal(false);
  productoEditando = signal<Producto | null>(null);
  busqueda = signal('');

  CategoriaProducto = CategoriaProducto;

  formulario = signal({
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: CategoriaProducto.BEBIDA_CALIENTE,
    stock: 0
  });

  productosFiltrados = computed(() => {
    const termino = this.busqueda().toLowerCase();
    if (!termino) return this.productos();

    return this.productos().filter(p =>
      p.nombre.toLowerCase().includes(termino) ||
      p.descripcion?.toLowerCase().includes(termino)
    );
  });

  categorias = [
    { id: CategoriaProducto.BEBIDA_CALIENTE, nombre: 'Bebida Caliente' },
    { id: CategoriaProducto.BEBIDA_FRIA, nombre: 'Bebida Fría' },
    { id: CategoriaProducto.REPOSTERIA, nombre: 'Repostería' },
    { id: CategoriaProducto.SANDWICH, nombre: 'Sándwich' },
    { id: CategoriaProducto.ENSALADA, nombre: 'Ensalada' },
    { id: CategoriaProducto.OTROS, nombre: 'Otros' }
  ];

  actualizarNombre(nombre: string): void {
    this.formulario.update(f => ({ ...f, nombre }));
  }

  actualizarDescripcion(descripcion: string): void {
    this.formulario.update(f => ({ ...f, descripcion }));
  }

  actualizarPrecio(precio: number): void {
    this.formulario.update(f => ({ ...f, precio }));
  }

  actualizarStock(stock: number): void {
    this.formulario.update(f => ({ ...f, stock }));
  }

  actualizarCategoria(categoria: CategoriaProducto): void {
    this.formulario.update(f => ({ ...f, categoria }));
  }

  abrirModalNuevo(): void {
    this.productoEditando.set(null);
    this.formulario.set({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: CategoriaProducto.BEBIDA_CALIENTE,
      stock: 0
    });
    this.mostrarModal.set(true);
  }

  abrirModalEditar(producto: Producto): void {
    this.productoEditando.set(producto);
    this.formulario.set({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria: producto.categoria,
      stock: producto.stock
    });
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.productoEditando.set(null);
  }

  guardarProducto(): void {
    const form = this.formulario();

    if (!form.nombre || form.precio <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const productoData: ProductoCreacion = {
      nombre: form.nombre,
      descripcion: form.descripcion || undefined,
      precio: form.precio,
      categoria: form.categoria,
      stock: form.stock
    };

    const productoEditando = this.productoEditando();
    if (productoEditando) {
      this.productoService.actualizarProducto(productoEditando.id, productoData);
    } else {
      this.productoService.crearProducto(productoData);
    }

    this.cerrarModal();
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id);
    }
  }

  ajustarStock(id: string, cantidad: number): void {
    const cantidadStr = prompt('Ingresa la cantidad a agregar (usar números negativos para reducir):', cantidad.toString());
    if (cantidadStr === null) return;

    const cantidadNumerica = parseInt(cantidadStr, 10);
    if (isNaN(cantidadNumerica)) {
      alert('Cantidad inválida');
      return;
    }

    const resultado = this.productoService.actualizarStock(id, cantidadNumerica);
    if (!resultado) {
      alert('No se pudo actualizar el stock (posiblemente stock insuficiente)');
    }
  }

  getNombreCategoria(categoria: CategoriaProducto): string {
    const cat = this.categorias.find(c => c.id === categoria);
    return cat?.nombre || categoria;
  }

  getTotalProductos(): number {
    return this.productos().length;
  }

  getValorInventario(): number {
    return this.productos().reduce((total, p) => total + (p.precio * p.stock), 0);
  }

  getProductosBajoStock(): number {
    return this.productos().filter(p => p.stock < 10).length;
  }
}
