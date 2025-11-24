import { Injectable, signal } from '@angular/core';
import { Mesa, MesaCreacion, UbicacionMesa, EstadoMesa } from '../models/mesa.model';

@Injectable({
  providedIn: 'root'
})
export class MesaService {
  private mesas = signal<Mesa[]>([]);

  constructor() {
    this.inicializarMesas();
  }

  private inicializarMesas(): void {
    const mesasIniciales: Mesa[] = [
      // Mesas interiores
      {
        id: '1',
        numero: 1,
        capacidad: 2,
        ubicacion: UbicacionMesa.INTERIOR,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      },
      {
        id: '2',
        numero: 2,
        capacidad: 4,
        ubicacion: UbicacionMesa.INTERIOR,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      },
      {
        id: '3',
        numero: 3,
        capacidad: 4,
        ubicacion: UbicacionMesa.INTERIOR,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      },
      {
        id: '4',
        numero: 4,
        capacidad: 6,
        ubicacion: UbicacionMesa.INTERIOR,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      },
      // Mesas de ventana
      {
        id: '5',
        numero: 5,
        capacidad: 2,
        ubicacion: UbicacionMesa.VENTANA,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      },
      {
        id: '6',
        numero: 6,
        capacidad: 2,
        ubicacion: UbicacionMesa.VENTANA,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      },
      // Mesas de terraza
      {
        id: '7',
        numero: 7,
        capacidad: 4,
        ubicacion: UbicacionMesa.TERRAZA,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      },
      {
        id: '8',
        numero: 8,
        capacidad: 4,
        ubicacion: UbicacionMesa.TERRAZA,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      },
      // Mesa privada
      {
        id: '9',
        numero: 9,
        capacidad: 8,
        ubicacion: UbicacionMesa.PRIVADO,
        estado: EstadoMesa.DISPONIBLE,
        activa: true
      }
    ];

    this.mesas.set(mesasIniciales);
  }

  getMesas() {
    return this.mesas.asReadonly();
  }

  getMesaById(id: string): Mesa | undefined {
    return this.mesas().find(m => m.id === id);
  }

  getMesasDisponibles(): Mesa[] {
    return this.mesas().filter(m => m.estado === EstadoMesa.DISPONIBLE && m.activa);
  }

  getMesasPorUbicacion(ubicacion: UbicacionMesa): Mesa[] {
    return this.mesas().filter(m => m.ubicacion === ubicacion && m.activa);
  }

  getMesasPorCapacidad(minPersonas: number): Mesa[] {
    return this.mesas().filter(m =>
      m.capacidad >= minPersonas &&
      m.estado === EstadoMesa.DISPONIBLE &&
      m.activa
    );
  }

  crearMesa(mesaData: MesaCreacion): Mesa {
    const nuevaMesa: Mesa = {
      id: Date.now().toString(),
      ...mesaData,
      estado: EstadoMesa.DISPONIBLE,
      activa: true
    };

    this.mesas.update(mesas => [...mesas, nuevaMesa]);
    return nuevaMesa;
  }

  actualizarEstadoMesa(id: string, nuevoEstado: EstadoMesa): Mesa | null {
    const index = this.mesas().findIndex(m => m.id === id);
    if (index === -1) return null;

    const mesaActualizada = {
      ...this.mesas()[index],
      estado: nuevoEstado
    };

    this.mesas.update(mesas => [
      ...mesas.slice(0, index),
      mesaActualizada,
      ...mesas.slice(index + 1)
    ]);

    return mesaActualizada;
  }

  liberarMesa(id: string): Mesa | null {
    return this.actualizarEstadoMesa(id, EstadoMesa.DISPONIBLE);
  }

  ocuparMesa(id: string): Mesa | null {
    return this.actualizarEstadoMesa(id, EstadoMesa.OCUPADA);
  }

  reservarMesa(id: string): Mesa | null {
    return this.actualizarEstadoMesa(id, EstadoMesa.RESERVADA);
  }

  eliminarMesa(id: string): boolean {
    const index = this.mesas().findIndex(m => m.id === id);
    if (index === -1) return false;

    this.mesas.update(mesas => mesas.filter(m => m.id !== id));
    return true;
  }

  getEstadisticas() {
    const mesas = this.mesas();
    return {
      total: mesas.filter(m => m.activa).length,
      disponibles: mesas.filter(m => m.estado === EstadoMesa.DISPONIBLE && m.activa).length,
      ocupadas: mesas.filter(m => m.estado === EstadoMesa.OCUPADA && m.activa).length,
      reservadas: mesas.filter(m => m.estado === EstadoMesa.RESERVADA && m.activa).length,
      mantenimiento: mesas.filter(m => m.estado === EstadoMesa.MANTENIMIENTO && m.activa).length
    };
  }
}