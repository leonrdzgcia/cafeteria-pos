import { Producto } from './producto.model';

export interface Pedido {
  id: string;
  numeroOrden: number;
  items: ItemPedido[];
  subtotal: number;
  impuestos: number;
  total: number;
  estado: EstadoPedido;
  metodoPago?: string;
  pagado: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  nombreCliente?: string;
  notas?: string;
}

export interface ItemPedido {
  id: string;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  EN_PREPARACION = 'EN_PREPARACION',
  LISTO = 'LISTO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

export interface PedidoCreacion {
  items: ItemPedidoCreacion[];
  nombreCliente?: string;
  notas?: string;
}

export interface ItemPedidoCreacion {
  productoId: string;
  cantidad: number;
  notas?: string;
}
