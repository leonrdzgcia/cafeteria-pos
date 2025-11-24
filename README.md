# Noni POS - Sistema de Punto de Venta para Cafetería

Sistema completo de punto de venta desarrollado en Angular v20, diseñado específicamente para cafeterías.

## Características

### 🛒 Punto de Venta (POS)
- Interfaz intuitiva para gestión de ventas
- Catálogo de productos con categorías
- Carrito de compras en tiempo real
- Búsqueda de productos
- Cálculo automático de subtotales, impuestos (16%) y totales
- Múltiples métodos de pago: Efectivo, Tarjeta de Débito/Crédito, Transferencia, QR
- Cálculo de cambio para pagos en efectivo
- Datos del cliente opcionales

### 🪑 Asignación de Mesas
- Gestión visual de mesas
- Asignación rápida de mesas a clientes
- Control de capacidad por mesa
- Registro de número de personas
- Generación automática de número de orden
- Estados de mesa: Disponible, Ocupada, Reservada, Mantenimiento
- Filtrado por ubicación: Interior, Ventana, Terraza, Privado
- Estadísticas en tiempo real
- Liberación automática de mesas

### 📦 Gestión de Inventario
- CRUD completo de productos
- Categorización de productos
- Control de stock en tiempo real
- Alertas de bajo stock
- Estadísticas del inventario
- Búsqueda y filtrado de productos

### 📋 Gestión de Pedidos
- Visualización de todos los pedidos
- Estados de pedido: Pendiente, En Preparación, Listo, Entregado, Cancelado
- Filtrado por estado
- Detalle completo de cada pedido
- Cambio de estado de pedidos
- Estadísticas de ventas diarias
- Historial completo

### 💰 Sistema de Pagos
- Múltiples métodos de pago
- Generación automática de referencias
- Registro completo de transacciones
- Estadísticas por método de pago

## Tecnologías

- **Angular 20** - Framework principal
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos
- **Signals API** - Gestión de estado reactiva
- **Standalone Components** - Arquitectura moderna de Angular
- **Lazy Loading** - Carga optimizada de módulos

## Instalación

### Requisitos previos
- Node.js (versión 18 o superior)
- npm (viene con Node.js)

### Pasos de instalación

1. Las dependencias ya están instaladas, pero si necesitas reinstalarlas:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm start
```

3. Abre tu navegador en:
```
http://localhost:4200
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── models/          # Modelos de datos TypeScript
│   │   ├── producto.model.ts
│   │   ├── pedido.model.ts
│   │   ├── pago.model.ts
│   │   ├── mesa.model.ts
│   │   └── asignacion.model.ts
│   ├── services/        # Servicios de lógica de negocio
│   │   ├── producto.service.ts
│   │   ├── pedido.service.ts
│   │   ├── pago.service.ts
│   │   ├── mesa.service.ts
│   │   └── asignacion.service.ts
│   ├── pages/          # Componentes de página
│   │   ├── pos.component.*
│   │   ├── asignacion.component.*
│   │   ├── inventario.component.*
│   │   └── pedidos.component.*
│   ├── app.component.*  # Componente principal
│   ├── app.routes.ts   # Configuración de rutas
│   └── app.config.ts   # Configuración de la aplicación
└── styles.scss         # Estilos globales
```

## Uso

### Punto de Venta
1. Navega a la sección "Punto de Venta"
2. Selecciona productos del catálogo
3. Ajusta cantidades según necesites
4. Opcionalmente ingresa el nombre del cliente
5. Haz clic en "Procesar Pago"
6. Selecciona el método de pago
7. Para efectivo, ingresa el monto recibido
8. Confirma el pago

### Asignación de Mesas
1. Navega a "Mesas"
2. Visualiza el estado de todas las mesas en tiempo real
3. Haz clic en "+ Nueva Asignación" o en una mesa disponible
4. Ingresa el nombre del cliente
5. Indica el número de personas
6. Selecciona una mesa con capacidad suficiente
7. Opcionalmente agrega notas
8. Confirma la asignación
9. El sistema genera automáticamente un número de orden
10. Para liberar la mesa, haz clic en la asignación activa y finalízala

### Gestión de Inventario
1. Navega a "Inventario"
2. Visualiza todos los productos
3. Usa "+ Nuevo Producto" para agregar productos
4. Haz clic en los iconos para editar o eliminar
5. Usa el icono de gráfica para ajustar el stock

### Gestión de Pedidos
1. Navega a "Pedidos"
2. Filtra por estado de pedido
3. Haz clic en un pedido para ver detalles
4. Cambia el estado del pedido según el flujo de trabajo
5. Cancela pedidos si es necesario

## Datos de Ejemplo

### Productos Precargados
- Café Espresso - $25
- Café Latte - $35
- Cappuccino - $38
- Té Verde - $22
- Jugo de Naranja - $30
- Croissant - $28
- Muffin de Chocolate - $32
- Sandwich Club - $55

### Mesas Configuradas
- **Interior:** 4 mesas (2 y 4 personas, 1 de 6 personas)
- **Ventana:** 2 mesas (2 personas cada una)
- **Terraza:** 2 mesas (4 personas cada una)
- **Privado:** 1 mesa (8 personas)

## Características Técnicas

### Arquitectura
- **Standalone Components**: No se utilizan módulos NgModule
- **Signals**: Gestión de estado reactiva moderna
- **Inject Function**: Inyección de dependencias moderna
- **Lazy Loading**: Carga diferida de componentes por ruta

### Diseño Responsivo
- Interfaz adaptable a diferentes tamaños de pantalla
- Grid flexible para productos y pedidos
- Navegación optimizada para móviles

### Persistencia de Datos
Actualmente los datos se almacenan en memoria (signals). Para producción se recomienda:
- Integrar con un backend REST API
- Implementar LocalStorage para persistencia local
- Agregar autenticación y autorización

## Próximas Mejoras Sugeridas

- [ ] Integración con backend/API REST
- [ ] Autenticación de usuarios
- [ ] Reportes y análisis de ventas
- [ ] Impresión de tickets
- [ ] Descuentos y promociones
- [ ] Gestión de empleados
- [ ] Dashboard con gráficas
- [ ] Exportación de datos (CSV, PDF)
- [ ] Sincronización en tiempo real
- [ ] Modo offline

## Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar tests
npm test

# Ejecutar linter
npm run lint
```

## Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio del proyecto.

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
