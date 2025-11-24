import { Injectable, signal } from '@angular/core';
import { Producto, ProductoCreacion, CategoriaProducto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private productos = signal<Producto[]>([]);

  constructor() {
    this.inicializarProductos();
  }

  private inicializarProductos(): void {
    const productosIniciales: Producto[] = [
      {
        id: '1',
        nombre: 'Café Espresso',
        descripcion: 'Café espresso tradicional',
        precio: 25,
        categoria: CategoriaProducto.BEBIDA_CALIENTE,
        stock: 100,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: '2',
        nombre: 'Café Latte',
        descripcion: 'Café con leche espumosa',
        precio: 35,
        categoria: CategoriaProducto.BEBIDA_CALIENTE,
        stock: 100,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: '3',
        nombre: 'Cappuccino',
        descripcion: 'Café con espuma de leche',
        precio: 38,
        categoria: CategoriaProducto.BEBIDA_CALIENTE,
        stock: 100,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: '4',
        nombre: 'Té Verde',
        descripcion: 'Té verde natural',
        precio: 22,
        categoria: CategoriaProducto.BEBIDA_CALIENTE,
        stock: 80,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: '5',
        nombre: 'Jugo Naranja',
        descripcion: 'Jugo de naranja natural',
        precio: 30,
        categoria: CategoriaProducto.BEBIDA_FRIA,
        stock: 50,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: '6',
        nombre: 'Croissant',
        descripcion: 'Croissant de mantequilla',
        precio: 28,
        categoria: CategoriaProducto.REPOSTERIA,
        stock: 30,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: '7',
        nombre: 'Muffin Chocolate',
        descripcion: 'Muffin con chispas de chocolate',
        precio: 32,
        categoria: CategoriaProducto.REPOSTERIA,
        stock: 25,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: '8',
        nombre: 'Sandwich Club',
        descripcion: 'Sandwich de pollo, tocino y vegetales',
        precio: 55,
        categoria: CategoriaProducto.SANDWICH,
        stock: 20,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    ];

    this.productos.set(productosIniciales);
  }

  getProductos() {
    return this.productos.asReadonly();
  }

  getProductoById(id: string): Producto | undefined {
    return this.productos().find(p => p.id === id);
  }

  getProductosPorCategoria(categoria: CategoriaProducto): Producto[] {
    return this.productos().filter(p => p.categoria === categoria && p.activo);
  }

  crearProducto(productoData: ProductoCreacion): Producto {
    const nuevoProducto: Producto = {
      id: Date.now().toString(),
      ...productoData,
      activo: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    this.productos.update(productos => [...productos, nuevoProducto]);
    return nuevoProducto;
  }

  actualizarProducto(id: string, cambios: Partial<ProductoCreacion>): Producto | null {
    const index = this.productos().findIndex(p => p.id === id);
    if (index === -1) return null;

    const productoActualizado = {
      ...this.productos()[index],
      ...cambios,
      fechaActualizacion: new Date()
    };

    this.productos.update(productos => [
      ...productos.slice(0, index),
      productoActualizado,
      ...productos.slice(index + 1)
    ]);

    return productoActualizado;
  }

  eliminarProducto(id: string): boolean {
    const index = this.productos().findIndex(p => p.id === id);
    if (index === -1) return false;

    this.productos.update(productos => productos.filter(p => p.id !== id));
    return true;
  }

  actualizarStock(id: string, cantidad: number): boolean {
    const producto = this.getProductoById(id);
    if (!producto) return false;

    const nuevoStock = producto.stock + cantidad;
    if (nuevoStock < 0) return false;

    this.actualizarProducto(id, { stock: nuevoStock });
    return true;
  }

  buscarProductos(termino: string): Producto[] {
    const terminoLower = termino.toLowerCase();
    return this.productos().filter(p =>
      p.activo && (
        p.nombre.toLowerCase().includes(terminoLower) ||
        p.descripcion?.toLowerCase().includes(terminoLower)
      )
    );
  }
}
