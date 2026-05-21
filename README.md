# FitGrade — B2B Fitness SaaS

A multi-role fitness performance tracking application for personal trainers, athletes, and coaches. Built and shipped to TestFlight in 7 days.

![Platform](https://img.shields.io/badge/platform-iOS-blue)
![Built With](https://img.shields.io/badge/built%20with-React%20Native%20%2B%20Expo-informational)
![Backend](https://img.shields.io/badge/backend-Firebase-orange)
![AI](https://img.shields.io/badge/AI-Claude%20API-purple)

---

## Overview

FitGrade gives personal trainers a real-time health dashboard for their clients. Trainers log session grades across five body regions, flag injuries, set targets, and generate AI-powered training plans. Athletes read their grades, view session history, and track progress. Coaches observe without editing.

---

## Features

**Trainer**
- Client roster with health grade overview and roster health score
- Session logging with body part grades (Head, Arm, Core, Leg, Foot)
- Injury flagging with severity levels and notes
- Target grade setting per body part
- AI-powered 7-day training plan generation via Claude API
- Quick log modal for fast grade updates
- Audit log tracking every change made
- Join code system to link athletes directly to their profile
- Org system for multi-trainer organizations
- Roster notes, competition countdown, active injury counter

**Athlete**
- Personal grade dashboard with body hologram
- Session history and progress charts
- Self-reporting mode (when enabled by trainer)
- Coach notes visible in read-only view

**Coach**
- Read-only view of athlete grades
- Observation notes sent to trainer and athlete

**App**
- Role-based access control (trainer / athlete / coach)
- Three trainer modes: Personal Trainer, Physical Therapist, Parent/Youth Coach
- Dark and light mode with persistence
- Offline banner detection
- Error boundary for crash protection
- Skeleton loaders and toast notifications
- Freemium model — 3 clients free, unlimited on Pro
- Paywall with monthly and annual plans

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| AI | Anthropic Claude API |
| Build | EAS Build |
| Local persistence | AsyncStorage |

---

## Architecture

```
fitgrade/
├── App.js                      ← root navigation and auth state
├── src/
│   ├── screens/
│   │   ├── TrainerHomeScreen.js
│   │   ├── AthleteHomeScreen.js
│   │   ├── ClientDetailScreen.js
│   │   ├── LogSessionScreen.js
│   │   ├── SessionHistoryScreen.js
│   │   ├── AITrainingPlanScreen.js
│   │   ├── ProfileSettingsScreen.js
│   │   ├── PaywallScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── RoleSelectScreen.js
│   │   ├── PrivacyPolicyScreen.js
│   │   └── TermsOfServiceScreen.js
│   ├── components/
│   │   ├── BodyHologram.js     ← SVG body with tap regions
│   │   ├── PartDetailSheet.js  ← grade history + exercises
│   │   ├── ProgressChart.js    ← session trend charts
│   │   ├── QuickLogModal.js
│   │   ├── JoinCodeModal.js
│   │   ├── SkeletonLoader.js
│   │   ├── Toast.js
│   │   ├── WelcomeTip.js
│   │   └── ErrorBoundary.js
│   ├── services/
│   │   ├── firebaseService.js  ← all Firestore operations
│   │   └── firebaseConfig.js
│   └── ui/
│       └── theme.js            ← palette, severity, grade utilities
```

---

## Data Model

```
trainers/{uid}
  ├── clients/{clientId}
  │   ├── sessions/{sessionId}
  │   ├── auditLog/{entryId}
  │   └── coachNotes/{noteId}
orgs/{orgId}
joinCodes/{code}
```

---

## Getting Started

```bash
git clone https://github.com/BrandonMontford-1/fitgrade
cd fitgrade
npm install
```

Create `src/services/aiConfig.js`:
```js
export const ANTHROPIC_API_KEY = 'your-key-here';
```

Create `src/services/firebaseConfig.js` with your Firebase project credentials.

```bash
npx expo start
```

---

## REST API

FitGrade has a companion REST API built with Node.js and Express.

**Repo:** [fitgrade-api](https://github.com/BrandonMontford-1/fitgrade-api)
**Live:** https://fitgrade-api-production.up.railway.app

---

## Status

- TestFlight: Active (Build 6)
- App Store: Pending submission
- REST API: Live on Railway

---

## Author

**Brandon Montford**
- GitHub: [@BrandonMontford-1](https://github.com/BrandonMontford-1)
- Email: br4ndonmontford@gmail.com
