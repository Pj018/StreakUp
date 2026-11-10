# 🔥 StreakUp — Gamified Habit Tracker & Routine Planner

A full-stack, production-ready, daily-use mobile application built for high retention and monetization.

---

## 📁 Project Architecture

```
new projects/
├── streakup-backend/      # ☕ Java Spring Boot 3.3 (Java 21) + PostgreSQL 16 REST API
│   ├── src/main/java/     # Controllers, Services, Security (JWT), Entities, Schedulers
│   ├── pom.xml            # Maven configuration
│   └── README.md          # Backend run guide & Swagger API documentation
│
└── streakup-mobile/       # 📱 React Native + Expo Mobile Application
    ├── src/               # Gamified UI, Today Checklist, Streak Engine, Rewarded Ads, Paywall
    ├── App.tsx            # Main App Navigator & Providers
    ├── package.json       # Expo SDK dependencies
    └── README.md          # Mobile quick start & Expo Go testing guide
```

---

## ⚡ Quick Start

### 1. Test the Mobile App immediately (with Expo)
```powershell
cd streakup-mobile
npm install
npx expo start
```
* Download **Expo Go** on your phone (Android/iOS) and scan the QR code to run it directly on your phone!
* Or press `w` in your terminal to test right in your web browser.

### 2. Start the Spring Boot Backend (with PostgreSQL)
```powershell
cd streakup-backend
mvn spring-boot:run
```
* Open Swagger API Docs: **http://localhost:8080/swagger-ui.html**
