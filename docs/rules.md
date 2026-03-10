# Reglas del Proyecto

Para mantener la consistencia y calidad del código, todos los colaboradores deben seguir estas reglas:

## 1. Idioma y Nomenclatura
- **Código en Inglés:** Todo el código técnico (nombres de variables, funciones, clases, comentarios técnicos, commits, etc.) debe escribirse exclusivamente en **inglés**.
- **Interfaz en Español:** Todos los mensajes dirigidos al usuario, etiquetas, textos de botones y cualquier parte visible de la interfaz deben mantenerse en **español**.

## 2. Gestión de Imports
- **Alias Obligatorio:** Se debe utilizar siempre el alias `@maximilian` para los imports internos.
- **Ejemplo Correcto:** `import { Button } from "@maximilian/components/Button";`
- **Ejemplo Incorrecto:** `import { Button } from "../../components/Button";`

## 3. Estilos y Diseño
- **Estilos Globales:** Los estilos se gestionan de forma centralizada. Se debe priorizar el uso de clases de utilidad de Tailwind CSS v4.
- **Configuración de Temas:** Cualquier cambio en la paleta de colores o variables de diseño debe realizarse en el bloque `@theme` de `src/index.css`.
- **Colores de Marca:**
    - Primario (Botones/Acciones): `brand-wine` (#722f37)
    - Fondos/Contraste: `brand-black` y `brand-white`.

## 4. Convenciones de Código
- Usar **PascalCase** para componentes de React y archivos de componentes.
- Usar **camelCase** para funciones y variables.
- Usar **TypeScript** de forma estricta; evitar el uso de `any`.
- Documentar funciones complejas con JSDoc.

## 5. Gestión de Formularios
- **Librerías Obligatorias:** Se debe utilizar **React Hook Form** para la gestión del estado de los formularios y **Zod** para la validación de esquemas.
- **Validación:** Todos los campos de entrada deben tener validaciones claras y mensajes de error descriptivos en español.
- **Tipado:** Utilizar el inferido de Zod para los tipos de datos del formulario (ej. `z.infer<typeof schema>`).

## 6. Interacción con Agentes IA
- **Validación de Cambios:** Antes de realizar un commit, el agente debe mostrar un resumen de los cambios realizados y los resultados de las pruebas de validación al usuario.
- **Confirmación de Commit:** El agente debe proponer un mensaje de commit descriptivo y solicitar la aprobación o edición del mismo por parte del usuario antes de ejecutar el comando `git commit`.
