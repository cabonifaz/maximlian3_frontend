# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on port 3000
npm run build     # Type-check (tsc -b) then Vite build
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

There is no test runner configured.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_API_URL=
VITE_DEBOUNCE_MS=1000
```

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4

**Path aliases:** `@maximilian/*` → `src/*` and `@/*` → `src/*` (the `@/` alias is used by shadcn components)

### Authentication & Authorization

AWS Amplify (Cognito) handles auth. After login, users select a role on `RoleSelectionPage`. That page calls `authService.getUserRoles()`, stores the full `UserSession` object as JSON in `sessionStorage` under `user_session`, and stores the selected role's numeric ID under `selected_role_id`. Routes are split by role (`/admin/*`, `/coordinator/*`) and lazy-loaded.

`GuestGuard` prevents authenticated users from accessing auth pages. Role-specific layouts (`AdminLayout`, `CoordinatorLayout`) wrap protected routes.

### API Layer

All HTTP calls go through the Axios instance in `src/services/maximilianService.ts`, which attaches four headers on every request:
- `Authorization: Bearer <accessToken>` — Cognito access token (from `fetchAuthSession()`)
- `idRol` — from `sessionStorage.getItem("selected_role_id")`
- `idUsuario` — from `sessionStorage.getItem("user_session")` parsed as `UserSession`
- `idEmpresa` — same `UserSession` object

The backend extracts all three numeric values in `TokenHelper.GetUsuario()` from request headers (not from JWT claims). The `UserSession` type (`src/shared/types/auth.type.ts`) has shape `{ idUsuario, idEmpresa, nombres, email, usuario, roles[] }`.

The response interceptor handles global toast notifications for errors/success.

Service modules (`user.service.ts`, `client.service.ts`, etc.) use this instance. API responses follow the envelope: `{ idTipoMensaje, mensaje, result }`.

API endpoint paths must be defined in a module-specific constants file under `src/shared/constants/endpoints/` and consumed from services and interceptors. Never write `/api/...` literals directly in service methods. Name each exported object `ENDPOINTS_<MODULO>` and group all routes used by that frontend module in its corresponding `*.endpoint.ts` file.

#### API Response Convention
Every endpoint returns `{ idTipoMensaje, mensaje, result }`:
- `idTipoMensaje: 1` (`BUSINESS_RULE_VIOLATION`) — business rule error
- `idTipoMensaje: 2` (`SUCCESS`) — success
- `idTipoMensaje: 3` (`ERROR`) — uncontrolled/system error

The `mensaje` field always contains the user-facing message for the operation result.
The Axios interceptor in `maximilianService.ts` handles all toast notifications globally:
- `toast.error(mensaje)` for any non-success response (idTipoMensaje ≠ 2)
- `toast.success(mensaje)` for successful non-GET requests (mutations)

Only show the message returned by the backend. If the backend does not return a response or `mensaje` is empty, do not display a toast and do not invent a fallback message. In service methods, throw `ErrorRespuestaApi` with the complete API response (for example, `throw new ErrorRespuestaApi(data)`), never a plain `Error` built from `mensaje`. Consumers must use `esErrorRespuestaApi(error)` and `error.idTipoMensaje`/`error.respuesta` when they need structured error details; never parse or compare `error.message` to identify an API error.

Never identify an error by parsing its text (`error.message.includes(...)`, equality checks, regex, etc.). Prefer structured signals such as error classes, `name`/codes supplied by the provider, HTTP status, API response fields, or platform events. For Vite dynamic import failures, use the `vite:preloadError` event and its `payload` instead of matching the browser-specific message.

**Never call `toast.success` manually in `onSuccess` handlers** — the interceptor covers it.

For non-API async operations (e.g. uploading files directly to S3 via presigned URLs), calling `toast.loading` / `toast.dismiss` / `toast.error` directly from a component is acceptable. Use `toast.loading(msg)` to get a toast ID, then `toast.dismiss(id)` on success or `toast.error(msg, { id })` on failure to replace it. Never expose raw AWS/third-party error messages — always show a user-friendly string.

When sending `tipoArchivo` to the backend to generate a presigned URL, always use the file's MIME type (`file.type`, e.g. `"application/pdf"`), not the file extension. The backend signs the URL with that content type, and S3 will reject the PUT with `SignatureDoesNotMatch` if the `Content-Type` header in the upload doesn't match exactly.

### Data Fetching

TanStack React Query v5 manages server state. Query keys follow the pattern `[entity, params]`. The `useAsyncService` hook (`src/hooks/useAsyncService.ts`) wraps non-query async operations with `AbortController` cancellation support.

### Forms

React Hook Form + Zod schemas (in `src/schemas/`) handle all forms. Schemas are colocated with their feature context. Modal forms must call `reset()` (from `useForm`) both on close and after a successful submit so state does not persist across modal open/close cycles. Use `mode: "onTouched"` for field-level validation feedback.

**Cross-field validation in custom resolvers**: When wrapping `zodResolver` in a custom `Resolver` to add cross-field checks (e.g. date comparison, conditional required fields), always make the resolver `async` and `await` the `zodResolver` call before mutating `result.errors`. `zodResolver` returns a `Promise` — reading or writing `result.errors` on the un-awaited Promise silently does nothing. Also prefer the resolver approach over Zod's `superRefine` for cross-field checks: `superRefine` may not run when other required fields in the schema fail validation simultaneously.

```ts
const myResolver: Resolver<MyFormData> = async (...args) => {
  const result = await zodResolver(mySchema)(...args);
  const { fieldA, fieldB } = args[0];
  if (someCondition(fieldA, fieldB)) {
    result.errors = {
      ...result.errors,
      fieldB: { type: "custom", message: "..." },
    };
  }
  return result;
};
```

### Routing

`src/router/index.tsx` composes role-based route modules. Routes are lazy-loaded per role. The default `/` redirects to `/login`.

### UI & Utilities

- Icons: `lucide-react`
- Toast notifications: `sonner` (triggered globally by the Axios response interceptor — avoid calling `toast` directly in service modules). Exception: non-API async operations like S3 presigned URL uploads may use `toast.loading`/`toast.dismiss`/`toast.error` directly in components — see the API Response Convention section above for the pattern.
- `masterTableService.list(idMaestro)` fetches dropdown options (countries, document types, etc.) keyed by a numeric `idMaestro`. The underlying endpoint is `/api/TablaMaestra/listar` with query param `IdMaestro`.
- All `<select>` fields backed by a `/MasterTable/` endpoint must use the `SearchableSelect` component (with the "Buscar..." search input) instead of a plain `<select>`. See `src/components/common/SearchableSelect.tsx`.
- For fields that accept multiple values (e.g. `lstIdFormatoDocumento: number[]`), use `MultiSearchableSelect` instead. It renders inline badges with X removal, a custom checkbox visual, and deduplicates options by `num1` (the backend can return duplicate entries). Pass `hideLabel` to suppress the label (e.g. when used in a filter toolbar) and `triggerIcon` to swap the default search icon for another lucide icon. See `src/components/common/MultiSearchableSelect.tsx`.
- **MasterTable fetching standard:** Both components accept an `idMaster` prop that makes them self-fetch lazily (only when the dropdown is opened) with `staleTime: Infinity`. MasterTable data is static reference data — once fetched it is reused from cache for the entire session. **Always prefer `idMaster` over fetching in the parent and passing `options`.** Exception: Edit modals where the current field value must be visible on open — fetch in the parent with `enabled: isOpen` and `staleTime: Infinity`, pass as `options`. For non-selector MasterTable usage (e.g. checkbox lists), use `useQuery` with `queryKey: ["masterTable", MasterTableId.X]`, `staleTime: Infinity`, `enabled: isOpen`. **Never use `useQuery` for MasterTable data without `staleTime: Infinity`.**
- **Auto-fill prefetch:** When a selection auto-fills other fields via `setValue` (e.g. selecting a client fills `idIdioma` and `idPlantillaInforme`), call `queryClient.prefetchQuery` for each affected MasterTable entry in the same handler. This puts the data in cache before the fields render, so the `idMaster`-driven selectors resolve their labels immediately without the user opening them.
- **Non-MasterTable lazy fetch:** `SearchableSelect` also accepts `onOpen?: () => void` (fires on first dropdown open) and `loading?: boolean` (shows the spinner). Use these when the options come from a non-MasterTable endpoint: hold a local `enabled` state, flip it to `true` in `onOpen`, and pass `isFetching` as `loading`. Access the fetched data for side-effects (e.g. `onSubmit`) via `queryClient.getQueryData()`.
- Modals with multiple tabs must use `CustomTabbedModal` from `src/components/common/CustomTabbedModal.tsx`. Pass `tabs` (id, label, content, optional indicator), a free `footer` slot (ReactNode), and manage `activeTab`/`onTabChange` in the parent. Use `tabVariant="segmented"` (default, pill strip) or `tabVariant="underline"` (border-bottom style) depending on the design.
- All paginated data tables (full-page lists like Usuarios, Clientes, Pedidos, etc.) must use `CustomTable` from `src/components/common/CustomTable.tsx`. Pass `columns` (array of `{ label, className? }`), `data`, `getId`, and `renderRow(item, index, isSelected) => ReactNode` (returns `<td>` elements only — `CustomTable` owns the `<tr>` wrapper). It handles loading/error/empty states, pagination with ellipsis, and an optional `selectable` prop (checkbox column, controlled via `selectedIds: Set<number>` + `onSelectionChange`) for bulk-action workflows. All query logic, filters, modals, and action menus stay in the parent page.
- All form field labels must use `CustomLabel` from `src/components/common/CustomLabel.tsx`. Pass `required` for mandatory fields (renders a red `*`) or `optional` for optional fields (renders gray `(opcional)`). It renders a `<label>` by default; pass `as="p"` for non-input-associated headings (e.g. role/language selection lists). Pass `className` to override the default `text-sm font-bold text-gray-700` when the surrounding context uses a different label style. `SearchableSelect` and `MultiSearchableSelect` accept `required` and `optional` props and use `CustomLabel` internally — do not add inline asterisk or "(opcional)" spans anywhere.
- **shadcn/ui** is installed and configured. Components are installed via `npx shadcn@latest add <component>` and land in `src/components/common/shadcn/`. Configuration lives in `components.json` at the project root. The `cn()` utility helper is at `src/lib/utils.ts`. shadcn components are NOT prefixed with `Custom` — they keep their original names (e.g., `Button`, `Dialog`, `Select`).
- Action buttons (submit, cancel, Nuevo, Editar, Eliminar, REINTENTAR, icon close) must use `CustomButton` from `src/components/common/CustomButton.tsx`. Variants: `primary` (black), `secondary` (bordered), `danger` (red), `wine` (dark red), `ghost` (icon). Sizes: `sm` (table actions), `compact` (dialog footers like ConfirmDeleteModal), `md` (modal footers), `icon` (close X). Use the `loading` prop for API-triggered buttons — it auto-disables, shows a spinner, and swaps text via `loadingText`. Exception: page-level "Agregar X" buttons (e.g. Agregar Cliente, Agregar Usuario) use raw `<button>` with wine styling to match the design pattern established in UserManagement.

### Types

All TypeScript types live in `src/shared/types/`. Service request/response shapes are defined there and should be kept in sync with backend API changes.


## Backend

The backend is an ASP.NET Core API located at `~/Work/Fractal/Maximilian3.0/maximlian3_backend/`.

Key things to know when calling the API from this frontend:
- All endpoints require `Authorization: Bearer <id_token>` and an `idRol` header (both attached automatically by the Axios interceptor)
- All responses follow `{ IdTipoMensaje, Mensaje, Result }` — mapped to `{ idTipoMensaje, mensaje, result }` in frontend types
- The backend solution has four projects: `WebApi` (controllers), `Handlers` (business logic), `DAO` (stored procedures via ADO.NET), `Models` (DTOs)

## Git

Never stage or commit anything under `.claude/`, or anything under `.playwright-mcp/`. These files are not in `.gitignore` but must be kept out of commits.

Commit messages must follow Conventional Commits (`type: short description`) and be a single concise sentence with no line breaks. Do not add `Co-Authored-By` or any Claude contribution credits.

## React Best Practices

### Naming Convention

**Language: all identifiers must be in Spanish.** This applies to every variable, function, custom hook, TypeScript type/interface, props interface, enum key, and Zod schema field defined in this codebase. No English words for domain concepts.

Rules:
- Replace English domain words with their Spanish equivalent: `username` → `usuario`, `masterTable` → `tablaMaestra`, `usernameCreacion` → `usuarioCreacion`.
- No accents or tildes: `creación` → `creacion`, `número` → `numero`.
- Replace `ñ` with `n`: `año` → `ano`, `España` → `Espana`.
- Technical/library identifiers that originate from external contracts — HTTP query parameter names the backend expects, JSON response field names, third-party library APIs — must match the contract exactly (e.g. `IdMaestro` as a query param, `LstTarifario` as a response field). Do not rename those to match the Spanish convention; name the frontend variable that *holds* the value in Spanish.

Examples of correct naming: `idUsuario`, `listaClientes`, `usuarioCreacion`, `tablaMaestra`, `pedidoActivo`. Examples that are wrong: `username`, `masterTable`, `usernameCreacion`, `lstItems` (English "list" abbreviation mixed with Spanish).

All custom-built components (not imported from third-party UI libraries like shadcn, Material UI, Bootstrap, etc.) must be prefixed with `Custom`. Examples: `CustomButton`, `CustomModal`, `CustomTable`. This applies to every reusable component created in this codebase, regardless of where it lives.

### Component Organization

Components are organized by module, mirroring the role-based routing structure:

```
src/components/
  admin/        # Components used only in admin pages
  coordinator/  # Components used only in coordinator pages
  auth/         # Components used only in auth pages
  common/       # Truly shared components (SearchableSelect, MultiSearchableSelect, etc.)
```

Always place a new component in the most specific module it belongs to. Only move a component to `common/` if it is actually reused across two or more modules. Never dump new components into the root of `src/components/` — every component belongs to a module.

### Component Size

Keep components focused and small. A component that grows beyond ~150 lines is a signal to split it. Extract:
- Repeated JSX structures into sub-components (e.g., `TableRow`, `FormSection`, `FilterBar`)
- Modal/dialog content into their own components
- List items, cards, and table rows that have non-trivial markup

Place sub-components in their module folder alongside the parent (e.g., `src/components/coordinator/`).

### Custom Hooks

Extract logic from components into custom hooks (`use*.ts` in `src/hooks/` or colocated in the feature folder) when:
- A component contains more than one `useEffect`, or a `useEffect` with complex logic
- State and derived values are tightly coupled and reused across components
- A block of logic (filtering, pagination, form orchestration) obscures the component's rendering intent

Name hooks to describe what they do, not how (`useClientFilters`, not `useClientPageState`). Design every custom hook with reusability in mind even if it is currently only used in one place.

## Comments

Only add comments when the logic of a function is genuinely complex and non-obvious. Do not comment straightforward code.
