import { Injectable, signal } from '@angular/core';
import { Asignacion, AsignacionCreacion, EstadoAsignacion } from '../models/asignacion.model';
import { MesaService } from './mesa.service';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private asignaciones = signal<Asignacion[]>([]);

  constructor(private mesaService: MesaService) {}

  private generarNumeroOrden(): number {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const anio = hoy.getFullYear().toString();

    // Obtener el número de asignaciones creadas hoy
    const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const asignacionesHoy = this.asignaciones().filter(a =>
      a.fechaAsignacion >= inicioDelDia
    );

    // El incremental es el número de asignaciones hoy + 1
    const incremental = (asignacionesHoy.length + 1).toString().padStart(4, '0');

    // Formato: DDMMYYYYNNNN
    const numeroOrden = `${dia}${mes}${anio}${incremental}`;
    return parseInt(numeroOrden, 10);
  }

  getAsignaciones() {
    return this.asignaciones.asReadonly();
  }

  getAsignacionById(id: string): Asignacion | undefined {
    return this.asignaciones().find(a => a.id === id);
  }

  getAsignacionesPorEstado(estado: EstadoAsignacion): Asignacion[] {
    return this.asignaciones().filter(a => a.estado === estado);
  }

  getAsignacionesActivas(): Asignacion[] {
    return this.asignaciones().filter(a => a.estado === EstadoAsignacion.ACTIVA);
  }

  getAsignacionPorMesa(mesaId: string): Asignacion | undefined {
    return this.asignaciones().find(a =>
      a.mesa.id === mesaId && a.estado === EstadoAsignacion.ACTIVA
    );
  }

  crearAsignacion(asignacionData: AsignacionCreacion): Asignacion | null {
    const mesa = this.mesaService.getMesaById(asignacionData.mesaId);
    if (!mesa) {
      console.error('Mesa no encontrada');
      return null;
    }

    if (mesa.estado !== 'DISPONIBLE') {
      console.error('Mesa no disponible');
      return null;
    }

    if (asignacionData.numeroPersonas > mesa.capacidad) {
      console.error('La mesa no tiene capacidad suficiente');
      return null;
    }

    const nuevaAsignacion: Asignacion = {
      id: Date.now().toString(),
      numeroOrden: this.generarNumeroOrden(),
      mesa: mesa,
      nombreCliente: asignacionData.nombreCliente,
      numeroPersonas: asignacionData.numeroPersonas,
      numeroAdultos: asignacionData.numeroAdultos,
      numeroNinos: asignacionData.numeroNinos,
      estado: EstadoAsignacion.ACTIVA,
      fechaAsignacion: new Date(),
      notas: asignacionData.notas
    };

    this.asignaciones.update(asignaciones => [...asignaciones, nuevaAsignacion]);

    // Ocupar la mesa
    this.mesaService.ocuparMesa(mesa.id);

    return nuevaAsignacion;
  }

  actualizarEstadoAsignacion(id: string, nuevoEstado: EstadoAsignacion): Asignacion | null {
    const index = this.asignaciones().findIndex(a => a.id === id);
    if (index === -1) return null;

    const asignacionActualizada = {
      ...this.asignaciones()[index],
      estado: nuevoEstado
    };

    if (nuevoEstado === EstadoAsignacion.FINALIZADA || nuevoEstado === EstadoAsignacion.CANCELADA) {
      asignacionActualizada.fechaLiberacion = new Date();
      // Liberar la mesa
      this.mesaService.liberarMesa(asignacionActualizada.mesa.id);
    }

    this.asignaciones.update(asignaciones => [
      ...asignaciones.slice(0, index),
      asignacionActualizada,
      ...asignaciones.slice(index + 1)
    ]);

    return asignacionActualizada;
  }

  vincularPedido(asignacionId: string, pedidoId: string): Asignacion | null {
    const index = this.asignaciones().findIndex(a => a.id === asignacionId);
    if (index === -1) return null;

    const asignacionActualizada = {
      ...this.asignaciones()[index],
      pedidoId: pedidoId,
      estado: EstadoAsignacion.ATENDIDA
    };

    this.asignaciones.update(asignaciones => [
      ...asignaciones.slice(0, index),
      asignacionActualizada,
      ...asignaciones.slice(index + 1)
    ]);

    return asignacionActualizada;
  }

  finalizarAsignacion(id: string): Asignacion | null {
    return this.actualizarEstadoAsignacion(id, EstadoAsignacion.FINALIZADA);
  }

  cancelarAsignacion(id: string): Asignacion | null {
    return this.actualizarEstadoAsignacion(id, EstadoAsignacion.CANCELADA);
  }

  getAsignacionesHoy(): Asignacion[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.asignaciones().filter(a => a.fechaAsignacion >= hoy);
  }

  getTotalPersonasAtendidas(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.asignaciones()
      .filter(a => a.fechaAsignacion >= hoy)
      .reduce((total, a) => total + a.numeroPersonas, 0);
  }

  getPromedioPersonasPorMesa(): number {
    const asignacionesHoy = this.getAsignacionesHoy();
    if (asignacionesHoy.length === 0) return 0;

    const totalPersonas = asignacionesHoy.reduce((total, a) => total + a.numeroPersonas, 0);
    return totalPersonas / asignacionesHoy.length;
  }
}
