# 🔔 CareBell

**AI-Powered Medicine Reminder for Elderly**  
React Native · Node.js · Firebase · Twilio · Azure TTS  

---

## 📱 Platform
- iOS & Android  

## ⚙️ Framework
- React Native  

## 🖥️ Backend
- Node.js + Firebase  

## 📦 Version
- 1.0.0  

## 📄 License
- MIT  

---

## ❓ What is CareBell?

CareBell is an AI-powered mobile app that helps elderly people take their medications on time — without needing any smartphone skills.

Family members set up the app once, and CareBell does the rest:
- Calls the patient at the right time  
- Speaks a reminder in their language  
- Alerts family members if there is no response  

Built for the aging population of Sri Lanka and beyond, CareBell solves one of the most dangerous problems in elderly care — **missed medications**.

---

## 🚨 The Problem We Solve

- **Missed doses** – Elderly patients forget medications  
- **No tech skills needed** – Works with any phone  
- **Family peace of mind** – Alerts family members  
- **Language barrier** – Supports Sinhala, Tamil, Hindi, and more  

---

## ⚙️ How It Works

1. Family member adds patient details and schedule  
2. Cloud scheduler triggers AI voice call  
3. Patient hears reminder (e.g., *"Press 1 to confirm"*)  
4. Patient presses 1 → dose confirmed  
5. No response → WhatsApp alert sent to family  

---

## ✨ Key Features

### 👨‍👩‍👧 For Family Members
- Add medications with custom schedules  
- Set language and voice style  
- Real-time dashboard  
- Call logs & reports  
- Weekly adherence reports  
- Manage alert contacts  
- WhatsApp & SMS alerts  

### 👴 For Elderly Patients
- No smartphone required  
- Simple phone call reminder  
- Press 1 to confirm  
- Retry calls if missed  

---

## 🤖 AI Voice Engine

- Azure Cognitive Services (Sinhala, Tamil voices)  
- Twilio Programmable Voice  
- Retry logic (up to 5 attempts)  
- DTMF keypress detection  

---

## 🧠 Technology Stack

| Layer        | Technology                         | Purpose |
|-------------|----------------------------------|--------|
| Mobile App  | React Native + Expo              | Cross-platform |
| Navigation  | React Navigation v6              | UI Navigation |
| Database    | Firebase Firestore               | Real-time DB |
| Auth        | Firebase Auth                    | Secure login |
| Voice Calls | Twilio Programmable Voice        | Call delivery |
| TTS         | Azure Cognitive Services         | Voice reminders |
| Scheduler   | Firebase Cloud Functions         | Automation |
| Alerts      | Twilio WhatsApp API              | Notifications |
| Backend     | Node.js + Express                | API & logic |

---

## 🌍 Supported Languages

- Sinhala (Female & Male)  
- Tamil  
- English  
- Hindi  

---

## 📁 Project Structure
```text
CareBell/
├── frontend/
│ ├── App.js
│ └── src/
│ ├── screens/
│ ├── components/
│ ├── services/
│ ├── navigation/
│ └── hooks/
│
└── backend/
├── server.js
├── scheduler.js
├── callEngine.js
├── alertService.js
├── .env
└── serviceAccount.json


```


---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js LTS → https://nodejs.org  
- Expo Go app  
- VS Code  

Create accounts:
- Firebase → https://firebase.google.com  
- Twilio → https://twilio.com  
- Azure → https://portal.azure.com  

---

## 📱 Frontend Setup

```bash
cd frontend
npx create-expo-app . --template blank
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install firebase @expo/vector-icons date-fns

```

## 🖥️ Backend Setup

```bash
cd backend
npm init -y
npm install express twilio axios dotenv firebase-admin node-cron cors
```

## 🔐 Environment Variables

```text
PORT=3000
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=southeastasia
FIREBASE_PROJECT_ID=your-project-id
```

##  ▶️ Run the App

```bash
# Frontend
cd frontend && npx expo start

# Backend
cd backend && node server.js
```
