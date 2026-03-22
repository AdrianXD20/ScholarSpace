# ScholarSpace — Frontend

Aplicación web de **portafolio estudiantil** con vistas separadas para **estudiante**, **docente** y **administrador**. El frontend está preparado para conectarse a una API REST cuando el backend y la base de datos estén listos; mientras tanto usa **datos mock** (principalmente `localStorage`) para desarrollo local.

---

## Descripción del proyecto

- **Estudiantes**: documentan apuntes, logros, actividades y experiencias; pueden unirse a **clases** mediante un código de invitación.
- **Docentes**: gestionan **clases/grupos**, ven solo a los alumnos de sus clases y consultan un **vista de solo lectura** del portafolio (logros profesionales, proyectos, experiencias, apuntes) y pueden dejar **mensajes de motivación** (mock).
- **Administración**: panel básico para roles con permiso `admin:panel`.
- **Autenticación**: login, registro (con campos extra para docentes), recuperación de contraseña; **roles y permisos** en el cliente; rutas protegidas.

Stack: **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Router**.

---

## Requisitos previos

- **Node.js** (recomendado: LTS actual, p. ej. 20.x o 22.x)
- **npm** (viene con Node) o **pnpm** / **yarn** si el equipo lo prefiere (los ejemplos usan `npm`)

Comprueba la instalación:

```bash
node -v
npm -v
```

---

## Clonar el repositorio (paso a paso)

1. Abre una terminal en la carpeta donde guardas proyectos.
2. Clona el repositorio (sustituye la URL por la de tu equipo):

   ```bash
   git clone https://github.com/TU-ORGANIZACION/ScholarSpace.git
   ```

3. Entra en la carpeta del proyecto:

   ```bash
   cd ScholarSpace
   ```

4. (Opcional) Comprueba que estás en la rama correcta (por ejemplo `main`):

   ```bash
   git branch
   git checkout main
   ```

---

## Instalar dependencias

En la raíz del proyecto (donde está `package.json`):

```bash
npm install
```

Esto descarga todas las dependencias listadas en `package.json` y las guarda en `node_modules/`. Solo hace falta ejecutarlo **una vez** tras clonar (o cuando cambien dependencias).

---

## Configuración de entorno

1. Copia el archivo de ejemplo:

   ```bash
   copy .env.example .env
   ```

   En macOS/Linux: `cp .env.example .env`

2. Edita `.env` y define al menos:

   | Variable | Descripción |
   |----------|-------------|
   | `VITE_API_URL` | URL base del backend (sin barra final), p. ej. `http://localhost:3000` o `https://api.tudominio.com` |
   | `VITE_USE_MOCK_AUTH` | `true` fuerza autenticación mock aunque exista URL; `false` usa la API si hay `VITE_API_URL` |

**Comportamiento actual:** si **no** defines `VITE_API_URL`, el front usa **mock** (localStorage) para auth y parte de los datos. Cuando el backend esté disponible, configura la URL y desactiva el mock según corresponda.

---

## Scripts útiles

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo (Vite), suele ser `http://localhost:5173` |
| `npm run build` | Compila TypeScript y genera la build de producción en `dist/` |
| `npm run preview` | Previsualiza la build de producción localmente |
| `npm run lint` | Ejecuta ESLint sobre el código |

---

## Estructura del frontend (orientación para el equipo)

```
ScholarSpace/
├── public/                 # Estáticos públicos
├── src/
│   ├── config/             # Configuración (p. ej. env.ts)
│   ├── constants/          # Constantes (permisos por rol, etc.)
│   ├── context/            # React Context (AuthContext)
│   ├── hooks/              # Hooks (useAuth, usePermissions, …)
│   ├── pages/
│   │   ├── auth/           # Login, registro, olvidé contraseña, reset
│   │   ├── dashboard/      # Vista estudiante/admin (apuntes, logros, perfil…)
│   │   └── profesor/       # Vista docente (panel, clases, portafolio alumno)
│   ├── routes/             # AppRouter, guards (rutas públicas/protegidas/roles)
│   ├── services/
│   │   ├── api/            # Cliente HTTP, endpoints, clientes listos (notesApi, portfolioApi)
│   │   ├── security/       # Tokens, rate limit de login
│   │   ├── auth.service.ts # Lógica de auth (mock + llamadas API)
│   │   ├── clases.service.ts
│   │   ├── notes.service.ts
│   │   ├── user.service.ts
│   │   └── …
│   ├── types/              # Tipos TypeScript (usuario, notas, clases…)
│   ├── components/       # UI reutilizable y layouts
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
└── vite.config.ts
```

La **vista docente** está agrupada en `src/pages/profesor/` para identificarla fácil frente al dashboard del alumno (`src/pages/dashboard/`).

---

## Cómo encaja la base de datos y el backend (para quien implemente la API)

El frontend **no** define motor SQL ni esquema físico; espera un **backend** que persista en base de datos y exponga una **API REST** (o compatible) bajo la URL configurada en `VITE_API_URL`. La idea de capas es:

| Capa en el front | Rol |
|------------------|-----|
| **Páginas / componentes** | UI, formularios, navegación |
| **Servicios** (`src/services/`) | Llamadas HTTP o, en mock, lectura/escritura local |
| **`httpClient`** (`src/services/api/httpClient.ts`) | `fetch` con `Authorization: Bearer`, manejo de errores, 401 → sesión |
| **`endpoints`** (`src/services/api/endpoints.ts`) | Rutas relativas acordadas con el backend |

### Entidades que el modelo de datos debería cubrir (alineado al front)

1. **Usuario**  
   - Campos base: id, nombre, email, institución, carrera, rol (`student` \| `teacher` \| `admin`), fechas.  
   - **Docente**: perfil académico (titulación, departamento, años de experiencia, cargo opcional).  
   - **Estudiante**: relación **N:M** con **clases** (un alumno puede estar en varias clases).

2. **Clase / grupo**  
   - id, nombre, descripción, `teacher_id`, **código de invitación** único, lista de estudiantes inscritos.

3. **Contenido del portafolio** (por `user_id`): apuntes, logros (con categoría), actividades (tipo y estado), experiencias.

4. **Autenticación**  
   - Login/registro devuelven al menos **usuario** + **accessToken** (y opcionalmente refresh); el front guarda el token en `sessionStorage` (en producción el backend puede preferir cookies httpOnly).

5. **Motivación docente → alumno** (actualmente mock en localStorage)  
   - En BD: mensajes con `teacher_id`, `student_id`, `class_id`, texto, fecha.

6. **Recuperación de contraseña**  
   - Flujo típico: solicitud por email + token de un solo uso + expiración; el front ya tiene pantallas y rutas de API definidas en `endpoints.auth`.

### Contrato esperado (referencia)

Los nombres exactos de JSON pueden ajustarse en `auth.service.ts` y en `mapApiUser`; hoy el front asume respuestas de login/registro con forma similar a:

```json
{
  "user": { "id", "name", "email", "role", "createdAt", … },
  "accessToken": "…",
  "refreshToken": "…"
}
```

El archivo `src/services/api/endpoints.ts` concentra las rutas relativas (`/auth/login`, `/notes`, `/achievements`, …) para que backend y front las alineen.

### Responsabilidades recomendadas

- **Base de datos + API**: validación de negocio, integridad referencial (clases, inscripciones), hashes de contraseña, JWT o sesiones, permisos por rol.  
- **Frontend**: presentación, estado de sesión en cliente, llamadas a la API; sustituir gradualmente los servicios mock (`notes.service`, `clases.service` en modo local) por los clientes HTTP (`notesApi`, etc.) cuando los endpoints estén listos.

---

## Documentación adicional

- Ejemplo de variables: `.env.example`
- Tipos de dominio: `src/types/`
- Reglas de permisos por rol: `src/constants/permissions.ts`

---

## Licencia

Según lo defina el repositorio del equipo (añadir aquí `LICENSE` si aplica).
