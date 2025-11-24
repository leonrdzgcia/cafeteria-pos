export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: CategoriaProducto;
  imagen?: string;
  stock: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export enum CategoriaProducto {
  BEBIDA_CALIENTE = 'BEBIDA_CALIENTE',
  BEBIDA_FRIA = 'BEBIDA_FRIA',
  REPOSTERIA = 'REPOSTERIA',
  SANDWICH = 'SANDWICH',
  ENSALADA = 'ENSALADA',
  OTROS = 'OTROS'
}

export interface ProductoCreacion {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: CategoriaProducto;
  imagen?: string;
  stock: number;
}
