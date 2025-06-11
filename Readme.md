# Receipts Management System

A monorepo full-stack application for uploading, parsing, and managing Tesco Home Delivery receipts. The system consists of a React frontend, a .NET Core Web API backend, and a PostgreSQL database, all orchestrated with Docker Compose.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Upload PDF receipts via the web interface
- Parse uploaded PDFs and extract line items from receipts
- Store and manage receipts and items in a PostgreSQL database
- View and manage receipts through a simple React UI

---

## Project Structure

```
.
├── client/           # React frontend (Vite + TypeScript)
├── ReceiptsApi/      # .NET Core Web API backend
├── docker-compose.yml
├── .env.docker
├── .env.development
├── logs/
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (for local frontend development)
- [.NET 7 SDK](https://dotnet.microsoft.com/en-us/download) (for local backend development)

---

## Environment Variables

Create a `.env.docker` file in the root directory with the following variables:

```
DB_NAME= 
DB_USER= 
DB_PASSWORD= 
DB_PORT= 
DB_HOST= 
ASPNETCORE_ENVIRONMENT=Docker
ALLOWED_ORIGINS=http://localhost:3000
```

For local development, use `.env.development` with similar variables.

---

## Running the Application

### With Docker Compose

1. **Build and start all services:**
   ```sh
   docker-compose up --build
   ```

2. **Access the frontend:**  
   [http://localhost:3000](http://localhost:3000)

3. **Access the backend API (Swagger UI):** 

    (or use PostMan)
   [http://localhost:5152/swagger](http://localhost:5152/swagger)

---

## Usage

- **Upload Receipts:** Use the web UI to upload PDF receipts.
- **View Receipts:** Browse and manage uploaded receipts and their parsed line items.
- **API:** Explore available endpoints via Swagger at `/swagger`.

---

## Development

### Frontend

```sh
cd client
npm install
npm run dev
```

### Backend

```sh
cd ReceiptsApi
dotnet restore
dotnet run
```

### Database

- The database is managed via Docker Compose and persists data in the `db_data` Docker volume.

---

## Troubleshooting

- **Database connection issues:** Ensure your `.env` files are correctly configured and the database container is running.
- **Port conflicts:** Make sure ports `3000` (frontend) and `5152` (backend) are available.
- **Logs:** Check the `logs/` directory for application logs.
