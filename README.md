# Pet Insurance DevOps API

API REST construida con **NestJS** para gestionar clientes, mascotas y pólizas de seguro, diseñada como laboratorio de prácticas **DevOps** con CI/CD, contenerización, observabilidad y despliegue en Kubernetes.

## Tabla de contenido

- [Resumen](#resumen)
- [Arquitectura funcional](#arquitectura-funcional)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución local](#ejecución-local)
- [Ejecución con Docker Compose](#ejecución-con-docker-compose)
- [API y autenticación](#api-y-autenticación)
- [Observabilidad](#observabilidad)
- [Generación de tráfico sintético](#generación-de-tráfico-sintético)
- [Pruebas y calidad](#pruebas-y-calidad)
- [CI/CD](#cicd)
- [Despliegue en Kubernetes](#despliegue-en-kubernetes)
- [Postman](#postman)
- [Limitaciones actuales](#limitaciones-actuales)

## Resumen

Este proyecto implementa:

- Registro y login con JWT.
- Endpoints protegidos para `customers`, `pets` y `policies`.
- Validación de DTOs con `class-validator`.
- Exposición de métricas Prometheus en `/metrics`.
- Endpoint de salud en `/health`.
- Scripts para simular tráfico y fallos controlados.
- Pipeline de CI/CD con GitHub Actions y Jenkins.

## Arquitectura funcional

```text
Client -> NestJS API (JWT + ValidationPipe)
                   -> In-memory stores (users, customers, pets, policies)
                   -> /health
                   -> /metrics (prom-client)

Prometheus <- scrape /metrics
Grafana <- datasource Prometheus
```

## Stack tecnológico

- **Backend:** NestJS 10, TypeScript
- **Auth:** Passport JWT, `@nestjs/jwt`, `bcryptjs`
- **Validación:** class-validator, class-transformer
- **Observabilidad:** prom-client, Prometheus, Grafana
- **Calidad y testing:** ESLint, Prettier, Jest
- **Contenedores:** Docker, Docker Compose
- **Orquestación:** Kubernetes (Deployment, Service, Ingress, Secret, Namespace)
- **Pipelines:** GitHub Actions, Jenkins, SonarQube, Snyk

## Estructura del proyecto

```text
.
├── src/
│   ├── auth/
│   ├── customers/
│   ├── pets/
│   ├── policies/
│   ├── health/
│   └── testing/                # endpoint /fake para errores/latencia
├── scripts/                    # scripts de tráfico y pruebas de observabilidad
├── monitoring/                 # configuración Prometheus + alertas
├── k8s/                        # manifiestos Kubernetes
├── postman/                    # colección de requests
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
└── .github/workflows/ci.yml
```

## Variables de entorno

Base (`.env.example`):

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=pet-insurance-secret-key
GRAFANA_PASSWORD=admin
```

Variables relevantes de scripts:

- `API_URL` (default `http://localhost:3000`)
- `ADMIN_EMAIL` (default `admin@petinsurance.com`)
- `ADMIN_PASSWORD` (default `admin123`)
- Ver cada script en `scripts/` para opciones adicionales.

## Ejecución local

### 1) Instalar dependencias

```bash
npm ci
```

### 2) Ejecutar en desarrollo

```bash
npm run start:dev
```

### 3) Verificar endpoints base

- API: [http://localhost:3000](http://localhost:3000)
- Health: [http://localhost:3000/health](http://localhost:3000/health)
- Metrics: [http://localhost:3000/metrics](http://localhost:3000/metrics)

## Ejecución con Docker Compose

Levanta API + Prometheus + Grafana:

```bash
docker compose up -d --build
```

Accesos:

- API: [http://localhost:3000](http://localhost:3000)
- Prometheus: [http://localhost:9090](http://localhost:9090)
- Grafana: [http://localhost:3001](http://localhost:3001)

Credenciales por defecto de Grafana:

- Usuario: `admin`
- Password: `admin` (o `GRAFANA_PASSWORD` si se define)

## API y autenticación

### Flujo recomendado

1. Registrar usuario: `POST /auth/register`
2. Iniciar sesión: `POST /auth/login`
3. Usar token JWT en `Authorization: Bearer <token>`

### Credenciales semilla

Existe un usuario administrador precargado en memoria:

- Email: `admin@petinsurance.com`
- Password: `admin123`

### Endpoints

Públicos:

- `POST /auth/register`
- `POST /auth/login`
- `GET /health`
- `GET /metrics`
- `GET /fake` (simulación de fallos/latencia)

Protegidos con JWT:

- `GET|POST /customers`, `GET|DELETE /customers/:id`
- `GET|POST /pets`, `GET /pets/:id`
- `GET|POST /policies`, `GET /policies/:id`

### Ejemplo rápido con cURL

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petinsurance.com","password":"admin123"}' | jq -r .access_token)

# Obtener customers
curl -s http://localhost:3000/customers \
  -H "Authorization: Bearer $TOKEN"
```

## Observabilidad

La aplicación expone métricas personalizadas y métricas por defecto de Node.js/Process:

- Counter: `http_requests_total{method,route,status_code}`
- Histogram: `http_request_duration_seconds{method,route,status_code}`

Configuración incluida:

- Prometheus scrape de `api:3000/metrics` cada 10 segundos.
- Reglas de alerta (`monitoring/alerts.yml`):
  - `HighErrorRate` (5xx)
  - `HighLatency` (P95 > 1s)

## Generación de tráfico sintético

Script principal para generar carga útil para dashboards y alertas:

```bash
npm run traffic:observability
```

También disponibles:

- `node scripts/seed-data.js`
- `node scripts/schedule-requests.js`
- `node scripts/notify-watcher.js`

Los scripts escriben logs/estado en el directorio `logs/`.

## Pruebas y calidad

Comandos:

```bash
npm run lint
npm run test
npm run test:cov
npm run test:ci
```

Estado actual verificado localmente:

- `4` suites pasando
- `22` tests pasando

## CI/CD

### GitHub Actions (`.github/workflows/ci.yml`)

Pipeline con jobs de:

1. Lint
2. Test + cobertura
3. SonarQube
4. Snyk (dependencias)
5. Build Docker + scan de imagen
6. Publicación en DockerHub (solo `main`)

Requiere secrets:

- `SONAR_TOKEN`, `SONAR_HOST_URL`
- `SNYK_TOKEN`
- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

### Jenkins (`Jenkinsfile`)

Stages:

1. Checkout
2. Install
3. Lint
4. Test + reportes JUnit/coverage
5. SonarQube + Quality Gate
6. Snyk (app + container)
7. Build Docker
8. Push registry (branch `main`)
9. Deploy Kubernetes (branch `main`)

## Despliegue en Kubernetes

Manifiestos en `k8s/`:

- `namespace.yml`
- `secret.yml`
- `deployment.yml`
- `service.yml`
- `ingress.yml`

Aplicación:

```bash
kubectl apply -f k8s/
```

Notas:

- Actualizar imagen en `k8s/deployment.yml` (`your-dockerhub-user/...`) o usar pipeline Jenkins para reemplazar `IMAGE_TAG`.
- Cambiar secreto JWT en `k8s/secret.yml` para ambientes reales.
- El Ingress usa host `pet-insurance.local`.

## Postman

Requests disponibles en:

- `postman/collections/Pet Insurance API/...`

Incluye operaciones de autenticación, clientes, mascotas y pólizas.

## Limitaciones actuales

- Persistencia en memoria (sin base de datos): reiniciar la app reinicia los datos.
- No existe control de ownership entre entidades (relaciones se aceptan por ID sin verificación fuerte).
- Los datos semilla de `pets`/`policies` incluyen IDs de ejemplo que no representan UUIDs reales de `customers`.
- `docker-compose.yml` referencia `monitoring/grafana/provisioning`; si no se crea esa ruta puede requerir ajuste según entorno.

---

Si quieres, en el siguiente paso puedo complementar este README con una sección de arquitectura visual (diagrama Mermaid) y ejemplos listos para importar en Postman.
