# healthcare-appointment-booking

## Project Overview

Healthcare Appointment Booking is a microservices-based application built with Spring Boot on the backend and React on the frontend. It provides:
- User authentication and authorization
- Patient management
- Doctor availability and scheduling
- Appointment booking, listing, search
- Emergency contact and doctor/patient dashboards
- Service discovery using Eureka

## Architecture

Backend services:
- `EurekaService` (service registry) - port `8761`
- `GatewayService` (API gateway) - port `9094`
- `AuthService` (authentication) - port `9091`
- `UserMgmtService` (user profiles and role management) - port `9092`
- `AppointmentService` (appointments engine) - port `9093`

Frontend:
- React app (SPA) - default port `3000`


## Prerequisites

- Java 17+ (or the version required by your `pom.xml` files)
- Maven 3.8+
- Node.js 18+ and npm 9+
- Optional: Docker for containerized deployment

## Setup and Run

### 1. Backend

From `/workspaces/healthcare-appointment-booking/Backend/<ServiceName>` run for each service:

```bash
./mvnw clean package
./mvnw spring-boot:run
```

Service-specific directories:
- `EurekaService`
- `GatewayService`
- `AuthService`
- `UserMgmtService`
- `AppointmentService`

> Start `EurekaService` first, then other services, then `GatewayService`.

### 2. Frontend

From `/workspaces/healthcare-appointment-booking/Frontend`:

```bash
npm install
npm start
```

The React app defaults to `http://localhost:3000`.

## Configuration

### Backend
Check `src/main/resources/application.properties` in each backend module. Default config:

- Eureka: `http://localhost:8761/eureka`
- ports: 8761, 9091, 9092, 9093, 9094

### Frontend
`.env.local` (or `REACT_APP_*` environment variables):

- `REACT_APP_API_BASE=http://localhost:9094`
- `REACT_APP_AUTH_BASE=http://localhost:9091`
- `REACT_APP_USER_BASE=http://localhost:9092`
- `REACT_APP_APPOINTMET_BASE=http://localhost:9093`

## Launch order

1. `EurekaService` (8761)
2. `AuthService`, `UserMgmtService`, `AppointmentService` (9091, 9092, 9093)
3. `GatewayService` (9094)
4. Frontend (3000)

## Usage

In browser:
- `http://localhost:3000` for app UI
- `http://localhost:8761` for Eureka dashboard

Key user flows:
- Register/Login
- Doctor availability management
- Patient appointment search & booking
- View dashboard for upcoming/rescheduled appointments
- Feedback and emergency reporting

## APIs
(Example routes, adjust according to controllers in code)

- Auth: `POST /auth/login`, `POST /auth/register`
- User: `GET /users`, `POST /users`, `GET /users/{id}`
- Appointments: `GET /appointments`, `POST /appointments`, `PUT /appointments/{id}`
- Doctor availability: `GET /doctors/{id}/availability`

## Tests

### Backend

From each backend module:

```bash
./mvnw test
```

### Frontend

```bash
npm test
```

## Troubleshooting

- If services fail to register, check that `eureka.client.serviceUrl.defaultZone` is set to `http://localhost:8761/eureka`
- If CORS issues appear, ensure gateway route and security settings allow `http://localhost:3000`
- If auth fails, confirm tokens are saved in localStorage key `healthcare_token`
- Run `./scripts/healthcheck.sh` after all services are running to validate endpoints

## Contribution

1. Fork the repo
2. Create feature branch
3. Open PR with description and test coverage

## Notes

- Maintain consistent package and naming conventions
- Confirm changes to port and route values in both backend and frontend
