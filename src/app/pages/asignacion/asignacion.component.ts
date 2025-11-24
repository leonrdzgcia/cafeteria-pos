import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MesaService } from '../../services/mesa.service';
import { AsignacionService } from '../../services/asignacion.service';
import { Mesa, UbicacionMesa, EstadoMesa } from '../../models/mesa.model';
import { Asignacion, EstadoAsignacion } from '../../models/asignacion.model';

@Component({
  selector: 'app-asignacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignacion.component.html',
  styleUrls: ['./asignacion.component.scss']
})
export class AsignacionComponent {
  private mesaService = inject(MesaService);
  private asignacionService = inject(AsignacionService);

  mesas = this.mesaService.getMesas();
  asignaciones = this.asignacionService.getAsignaciones();

  mostrarModalAsignacion = signal(false);
  mostrarDetalleAsignacion = signal(false);
  asignacionSeleccionada = signal<Asignacion | null>(null);
  ubicacionFiltro = signal<UbicacionMesa | 'TODAS'>('TODAS');

  UbicacionMesa = UbicacionMesa;
  EstadoMesa = EstadoMesa;
  EstadoAsignacion = EstadoAsignacion;

  // Formulario de asignación
  formularioAsignacion = signal({
    mesaId: '',
    nombreCliente: '',
    numeroPersonas: 1,
    numeroAdultos: 1,
    numeroNinos: 0,
    notas: ''
  });

  mesasFiltradas = computed(() => {
    let mesas = this.mesas();

    if (this.ubicacionFiltro() !== 'TODAS') {
      mesas = mesas.filter(m => m.ubicacion === this.ubicacionFiltro());
    }

    return mesas.filter(m => m.activa);
  });

  mesasDisponibles = computed(() =>
    this.mesasFiltradas().filter(m => m.estado === EstadoMesa.DISPONIBLE)
  );

  asignacionesActivas = computed(() =>
    this.asignaciones().filter(a => a.estado === EstadoAsignacion.ACTIVA)
  );

  estadisticasMesas = computed(() => this.mesaService.getEstadisticas());

  ubicaciones = [
    { id: 'TODAS', nombre: 'Todas' },
    { id: UbicacionMesa.INTERIOR, nombre: 'Interior' },
    { id: UbicacionMesa.VENTANA, nombre: 'Ventana' },
    { id: UbicacionMesa.TERRAZA, nombre: 'Terraza' },
    { id: UbicacionMesa.PRIVADO, nombre: 'Privado' }
  ];

  seleccionarUbicacion(ubicacion: UbicacionMesa | 'TODAS'): void {
    this.ubicacionFiltro.set(ubicacion);
  }

  abrirModalAsignacion(mesa?: Mesa): void {
    if (mesa) {
      this.formularioAsignacion.set({
        mesaId: mesa.id,
        nombreCliente: '',
        numeroPersonas: 1,
        numeroAdultos: 1,
        numeroNinos: 0,
        notas: ''
      });
    } else {
      this.formularioAsignacion.set({
        mesaId: '',
        nombreCliente: '',
        numeroPersonas: 1,
        numeroAdultos: 1,
        numeroNinos: 0,
        notas: ''
      });
    }
    this.mostrarModalAsignacion.set(true);
  }

  cerrarModalAsignacion(): void {
    this.mostrarModalAsignacion.set(false);
  }

  seleccionarMesa(mesaId: string): void {
    this.formularioAsignacion.update(f => ({ ...f, mesaId }));
  }

  actualizarNombreCliente(nombre: string): void {
    this.formularioAsignacion.update(f => ({ ...f, nombreCliente: nombre }));
  }

  actualizarNumeroPersonas(numero: number): void {
    this.formularioAsignacion.update(f => ({ ...f, numeroPersonas: numero }));
  }

  actualizarNumeroAdultos(numero: number): void {
    const numeroAdultos = Math.max(0, numero);
    this.formularioAsignacion.update(f => {
      const numeroNinos = f.numeroNinos;
      return {
        ...f,
        numeroAdultos,
        numeroPersonas: numeroAdultos + numeroNinos
      };
    });
  }

  actualizarNumeroNinos(numero: number): void {
    const numeroNinos = Math.max(0, numero);
    this.formularioAsignacion.update(f => {
      const numeroAdultos = f.numeroAdultos;
      return {
        ...f,
        numeroNinos,
        numeroPersonas: numeroAdultos + numeroNinos
      };
    });
  }

  actualizarNotas(notas: string): void {
    this.formularioAsignacion.update(f => ({ ...f, notas }));
  }

  crearAsignacion(): void {
    const form = this.formularioAsignacion();

    if (!form.mesaId) {
      alert('Selecciona una mesa');
      return;
    }

    if (!form.nombreCliente || form.nombreCliente.trim() === '') {
      alert('Ingresa el nombre del cliente');
      return;
    }

    if (form.numeroPersonas < 1) {
      alert('El número de personas debe ser al menos 1');
      return;
    }

    const mesa = this.mesaService.getMesaById(form.mesaId);
    if (mesa && form.numeroPersonas > mesa.capacidad) {
      alert(`La mesa seleccionada solo tiene capacidad para ${mesa.capacidad} personas`);
      return;
    }

    const asignacion = this.asignacionService.crearAsignacion({
      mesaId: form.mesaId,
      nombreCliente: form.nombreCliente.trim(),
      numeroPersonas: form.numeroPersonas,
      numeroAdultos: form.numeroAdultos,
      numeroNinos: form.numeroNinos,
      notas: form.notas
    });

    if (asignacion) {
      alert(`Mesa asignada exitosamente. Número de orden: ${asignacion.numeroOrden}`);
      this.cerrarModalAsignacion();
    } else {
      alert('Error al asignar la mesa. Verifica que la mesa esté disponible.');
    }
  }

  verDetalleAsignacion(asignacion: Asignacion): void {
    this.asignacionSeleccionada.set(asignacion);
    this.mostrarDetalleAsignacion.set(true);
  }

  cerrarDetalleAsignacion(): void {
    this.mostrarDetalleAsignacion.set(false);
    this.asignacionSeleccionada.set(null);
  }

  finalizarAsignacion(id: string): void {
    if (confirm('¿Finalizar esta asignación y liberar la mesa?')) {
      this.asignacionService.finalizarAsignacion(id);
      this.cerrarDetalleAsignacion();
    }
  }

  cancelarAsignacion(id: string): void {
    if (confirm('¿Cancelar esta asignación y liberar la mesa?')) {
      this.asignacionService.cancelarAsignacion(id);
      this.cerrarDetalleAsignacion();
    }
  }

  getColorEstadoMesa(estado: EstadoMesa): string {
    const colores: Record<EstadoMesa, string> = {
      [EstadoMesa.DISPONIBLE]: '#27ae60',
      [EstadoMesa.OCUPADA]: '#e74c3c',
      [EstadoMesa.RESERVADA]: '#f39c12',
      [EstadoMesa.MANTENIMIENTO]: '#95a5a6'
    };
    return colores[estado];
  }

  getNombreEstadoMesa(estado: EstadoMesa): string {
    const nombres: Record<EstadoMesa, string> = {
      [EstadoMesa.DISPONIBLE]: 'Disponible',
      [EstadoMesa.OCUPADA]: 'Ocupada',
      [EstadoMesa.RESERVADA]: 'Reservada',
      [EstadoMesa.MANTENIMIENTO]: 'Mantenimiento'
    };
    return nombres[estado];
  }

  getNombreUbicacion(ubicacion: UbicacionMesa): string {
    const nombres: Record<UbicacionMesa, string> = {
      [UbicacionMesa.INTERIOR]: 'Interior',
      [UbicacionMesa.VENTANA]: 'Ventana',
      [UbicacionMesa.TERRAZA]: 'Terraza',
      [UbicacionMesa.PRIVADO]: 'Privado'
    };
    return nombres[ubicacion];
  }

  getIconoUbicacion(ubicacion: UbicacionMesa): string {
    const iconos: Record<UbicacionMesa, string> = {
      [UbicacionMesa.INTERIOR]: '🏠',
      [UbicacionMesa.VENTANA]: '🪟',
      [UbicacionMesa.TERRAZA]: '🌳',
      [UbicacionMesa.PRIVADO]: '🚪'
    };
    return iconos[ubicacion];
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

  getTotalAsignacionesHoy(): number {
    return this.asignacionService.getAsignacionesHoy().length;
  }

  getTotalPersonasAtendidas(): number {
    return this.asignacionService.getTotalPersonasAtendidas();
  }
}
