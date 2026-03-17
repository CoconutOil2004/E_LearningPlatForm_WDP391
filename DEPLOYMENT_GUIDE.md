# Deployment & DevOps Guide

This guide provides instructions on how to use Docker, Nginx, and CI/CD for the LearnX project.

## 🐳 Docker

Docker is used to containerize both the frontend and backend, ensuring consistent behavior across different environments.

### Prerequisite
Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Local Development with Docker
To start the entire platform (Backend + Frontend + Nginx):
1. **Prepare Environment**: Ensure `back-end/.env` exists.
2. **Run Orchestration**:
   ```bash
   docker-compose up --build
   ```
3. **Access the App**:
   - Frontend: `http://localhost` (Port 80)
   - Backend API: `http://localhost:9999`

### Individual Containers
- **Backend**: `back-end/Dockerfile` builds the Node.js API.
- **Frontend**: `front-end/Dockerfile` is a multi-stage build:
  1. Builds the React app.
  2. Uses Nginx to serve the static files and act as a reverse proxy.

---

## 🌐 Nginx

Nginx acts as a **Reverse Proxy** within the frontend container.

### Why we use Nginx:
- **Routing**: Routes `/api/*` requests to the backend container.
- **WebSocket**: Handles `Socket.IO` connections upgrade.
- **Static Hosting**: Serves the React build efficiently.

### Configuration
The main configuration is located at `front-end/nginx.conf`.
- **Port**: 80
- **Logic**:
  - `/` -> React Build files.
  - `/api/` -> Proxy to `http://backend:9999/api/`.
  - `/socket.io/` -> Proxy to `http://backend:9999/socket.io/`.

---

## 🚀 CI/CD (GitHub Actions)

The project uses GitHub Actions for continuous integration, located in `.github/workflows/ci.yml`.

### Workflow Steps:
1. **Frontend Verification**:
   - Installs dependencies.
   - Runs `npm run build` to ensure no compilation errors.
2. **Backend Verification**:
   - Installs dependencies.
   - Runs linting (if configured).
3. **Docker Integrity**:
   - Attempts to build both Docker images to verify the `Dockerfile` syntax and build flow.

### How to trigger:
- **Push**: Every push to the `main` branch.
- **Pull Request**: Every PR targeting the `main` branch.

### Viewing Results:
Go to the **Actions** tab on your GitHub repository to see the status of your builds.

---

## 🛠 Troubleshooting
- **CORS Issues**: Ensure `CLIENT_URL` in `.env` matches the domain Nginx is serving from.
- **Database Connection**: Ensure the backend container can reach your MongoDB instance (use `host.docker.internal` for local DBs or the full URI for Atlas).
- **Port Conflict**: If port 80 or 9999 is taken, modify `docker-compose.yml`.
