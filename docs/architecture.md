# Arquitectura del Sistema

El proyecto **Maximilian Web V3** sigue una arquitectura de Single Page Application (SPA) modular y orientada a roles.

## Estructura de Capas

### 1. Capa de Presentación (UI)
- **Componentes (`/src/components`):** Componentes reutilizables y atómicos. Incluye layouts principales como `AdminLayout`.
- **Páginas (`/src/pages`):** Vistas completas organizadas por módulos funcionales (ej. `Admin`, `Shared`).

### 2. Capa de Navegación (Routing)
- **Router (`/src/router`):** Configuración centralizada utilizando React Router v7. Las rutas están modularizadas por roles (ej. `admin.routes.tsx`) para facilitar el mantenimiento y la escalabilidad.

### 3. Capa de Lógica y Estado
- **Hooks Personalizados (`/src/hooks`):** Encapsulan lógica de estado reutilizable. El hook principal es `useAsyncService`, que gestiona llamadas asíncronas, estados de carga, errores y cancelación de peticiones.
- **Servicios (`/src/services`):** Instancias de Axios configuradas para la comunicación con la API.

### 4. Capa Compartida (Shared)
- **Tipos (`/src/shared/types`):** Definiciones de TypeScript para asegurar la integridad de los datos en toda la aplicación.
- **Utilidades (`/src/shared/utils`):** Funciones de propósito general.

## Flujo de Datos
La aplicación utiliza un flujo unidireccional. Los componentes invocan hooks o servicios, los cuales actualizan el estado local o global, provocando el re-renderizado de la interfaz. Se prioriza el uso de `AbortController` para evitar "race conditions" en llamadas asíncronas.
