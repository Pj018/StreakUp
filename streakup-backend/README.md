# ☕ StreakUp Backend API (Spring Boot 3 + PostgreSQL)

Enterprise-grade REST API backend powering **StreakUp: Gamified Habit Tracker & Routine Planner**.

---

## 🛠️ Tech Stack
- **Framework:** Spring Boot 3.3.4 (Java 21)
- **Database:** PostgreSQL (with H2 testing support)
- **Security:** Spring Security + Stateless JWT (JJWT 0.12.5)
- **ORM:** Spring Data JPA / Hibernate
- **Scheduler:** Spring `@Scheduled` Cron Engine (Midnight Streak Evaluation)
- **Documentation:** SpringDoc OpenAPI 3 / Swagger UI

---

## 🚀 How to Run

### 1. Database Setup
Create database in PostgreSQL:
```sql
CREATE DATABASE streakup_db;
```
*(Default user: `postgres`, password: `postgres`, port: `5432`)*

### 2. Start the Backend Server
```powershell
cd streakup-backend
mvn spring-boot:run
```

Or run via Maven wrapper:
```powershell
.\mvnw spring-boot:run
```

### 3. Open Swagger API Docs
Once started, navigate to:
👉 **http://localhost:8080/swagger-ui.html**

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status | No |
| `POST` | `/api/v1/auth/register` | Register new user | No |
| `POST` | `/api/v1/auth/login` | Login user & get JWT | No |
| `GET` | `/api/v1/user/profile` | Current user profile, XP, Level, Shields | Yes (Bearer) |
| `GET` | `/api/v1/habits` | List all active habits + current streaks | Yes (Bearer) |
| `POST` | `/api/v1/habits` | Create habit (Free tier enforces max 4 limit) | Yes (Bearer) |
| `POST` | `/api/v1/habits/{id}/complete`| Complete habit (+10 XP & Streak increment) | Yes (Bearer) |
| `DELETE` | `/api/v1/habits/{id}` | Archive a habit | Yes (Bearer) |
| `POST` | `/api/v1/streaks/revive-with-ad`| Revive broken streak after Rewarded Video Ad | Yes (Bearer) |
| `POST` | `/api/v1/streaks/{habitId}/shield`| Protect streak with 1 streak shield | Yes (Bearer) |
| `POST` | `/api/v1/streaks/trigger-midnight-eval`| Test the midnight evaluation engine | Yes (Bearer) |
| `GET` | `/api/v1/gamification/badges` | All badges + user unlock status | Yes (Bearer) |
| `GET` | `/api/v1/gamification/heatmap` | 60-day calendar consistency heatmap | Yes (Bearer) |
| `POST` | `/api/v1/subscriptions/upgrade` | Upgrade to Pro & grant 5 bonus shields | Yes (Bearer) |
| `GET` | `/api/v1/subscriptions/current` | Active subscription details | Yes (Bearer) |
