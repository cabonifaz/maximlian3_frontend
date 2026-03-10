# Tecnologías y Uso

Este proyecto utiliza un stack moderno para garantizar el rendimiento y la experiencia de desarrollo.

## Core Stack

### React 19
- **Uso:** Framework principal para la UI.
- **Patrones:** Se utilizan componentes funcionales y hooks. Se aprovecha la mejora en el manejo de referenciación y transiciones.

### Vite 7
- **Uso:** Herramienta de construcción (bundler) y servidor de desarrollo.
- **Ventaja:** Ofrece un HMR (Hot Module Replacement) extremadamente rápido y una configuración optimizada para TypeScript.

### Tailwind CSS v4
- **Uso:** Framework de estilos.
- **Novedad:** Utiliza el nuevo motor "Oxygen" y configuración basada en CSS puro mediante `@theme`. Los estilos se mantienen globales para evitar duplicidad y asegurar consistencia visual.

### React Router v7
- **Uso:** Gestión de rutas y navigation.
- **Configuración:** Se utiliza `createBrowserRouter` para una definición declarativa de rutas, permitiendo el uso de "Loaders" y "Actions" en el futuro.

### React Hook Form
- **Uso:** Gestión eficiente del estado de los formularios y manejo de envíos.
- **Ventaja:** Minimiza los re-renderizados y simplifica la integración con validaciones externas.

### Zod
- **Uso:** Validación de esquemas de datos y tipado estricto.
- **Implementación:** Se integra con React Hook Form mediante `@hookform/resolvers` para validar formularios en el lado del cliente.

## Herramientas de Soporte

### Axios
- **Uso:** Cliente HTTP para peticiones a la API.
- **Implementación:** Configurado con interceptores y tiempos de espera (timeout) en `src/services/maximilianService.ts`.

### Lucide React
- **Uso:** Set de iconos ligeros y consistentes.
- **Regla:** Todos los iconos de la interfaz deben provenir de esta librería.

### ESLint 9
- **Uso:** Linter para asegurar estándares de código. Configurado con reglas específicas para React Hooks y TypeScript.
