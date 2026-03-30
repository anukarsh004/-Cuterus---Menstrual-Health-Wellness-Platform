# 🌸 Cuterus - Menstrual Health & Wellness Platform

<div align="center">

![Cuterus Logo](https://img.shields.io/badge/Cuterus-Menstrual%20Health-ff69b4?style=for-the-badge&logo=heart&logoColor=white)

**A comprehensive menstrual health tracking and wellness platform with AI-powered insights**

[![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat-square&logo=openai)](https://openai.com/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 About

**Cuterus** is a modern, privacy-focused menstrual health platform designed to help users understand their bodies better. It provides cycle tracking, symptom logging, AI-powered health insights, and phase-specific wellness recommendations.

The platform supports multiple user roles:
- **Personal Users** - Individual cycle tracking and health management
- **Employees** - Workplace wellness with cycle-aware productivity tips
- **HR Managers** - Anonymized aggregate wellness insights
- **Monitors** - Third-party oversight with privacy controls

---

## ✨ Features

### 🩸 Core Features
- **Cycle Calendar** - Track periods, predict next cycle, log flow intensity
- **Symptom Tracker** - Log 15+ symptoms with severity ratings and trigger tags
- **Phase Awareness** - Real-time phase detection (Menstruation, Follicular, Ovulation, Luteal)
- **Health Reports** - Generate PDF reports with cycle history and analytics

### 🤖 AI-Powered
- **Utaura AI Chatbot** - GPT-4 powered wellness companion for personalized advice
- **Phase-Specific Tips** - AI-generated recommendations based on current cycle phase
- **Symptom Analysis** - Pattern recognition and insights

### 🌙 Wellness Features
- **Sleep Tracker** - Log sleep quality with phase-specific optimization tips
- **Stress Management** - Guided breathing exercises (4-7-8, Box, Calm, Energize) + journaling
- **Workout Library** - 10+ phase-appropriate yoga, pilates, and cardio videos
- **Custom Remedies** - Save your own remedies for different symptoms

### ⚙️ Personalization
- **Dark Mode** - Toggle between light and dark themes
- **Multi-Language** - English, Spanish, and French support
- **Notifications** - Configurable period and logging reminders
- **Voice Commands** - Hands-free symptom logging (Web Speech API)

### 👥 Enterprise Features
- **Work Wellness** - Cycle-aware productivity scheduling for employees
- **Direct Comm Link** - Secure chat between employees and monitors
- **HR Dashboard** - Anonymized workforce wellness analytics
- **Privacy Controls** - Users control what data is shared

---

## 🖼️ Demo

### Dashboard
The interactive dashboard shows your current phase, cycle day, symptom trends, and personalized tips.

### Cycle Phases
| Phase | Energy | Best For |
|-------|--------|----------|
| 🔴 Menstruation | Low | Rest, light tasks, self-care |
| 🌱 Follicular | Rising | New projects, creativity, learning |
| 🌕 Ovulation | Peak | Presentations, networking, leadership |
| 🌙 Luteal | Declining | Detail work, organization, reflection |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for chatbot)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cuterus.git
cd cuterus
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Configure environment**
```bash
# Create backend/.env.local and add:
OPENAI_API_KEY=your-openai-api-key
PORT=5000
```

4. **Start the application**

**Windows:**
```bash
# Double-click START_ALL.bat
# Or run manually:
START_ALL.bat
```

**macOS/Linux:**
```bash
chmod +x START_ALL.sh
./START_ALL.sh
```

**Manual start:**
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

---

## 📁 Project Structure

```
cuterus/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── DashboardLayout.jsx
│   │   ├── SharedMessageBox.jsx
│   │   └── ...
│   ├── context/          # React Context providers
│   │   ├── AppContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── LanguageContext.jsx
│   ├── pages/            # Page components
│   │   ├── DashboardHome.jsx
│   │   ├── ChatPage.jsx
│   │   ├── SleepTrackerPage.jsx
│   │   ├── StressManagementPage.jsx
│   │   ├── WorkoutPage.jsx
│   │   └── ...
│   ├── firebase/         # Firebase configuration
│   ├── utils/            # Utility functions
│   └── main.jsx          # App entry point
├── backend/
│   ├── src/
│   │   └── server.js     # Express + OpenAI API
│   └── .env.local        # Environment variables
├── public/               # Static assets
├── START_ALL.bat         # Windows startup script
├── START_ALL.sh          # Unix startup script
└── package.json
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **OpenAI SDK** - AI integration
- **JWT** - Authentication

### Database & Services
- **Firebase Firestore** - Real-time database
- **Firebase Auth** - Authentication (optional)
- **LocalStorage** - Offline data persistence

---

## ⚙️ Configuration

### Environment Variables

**Backend (`backend/.env.local`):**
```env
# Required
OPENAI_API_KEY=sk-your-openai-key
PORT=5000

# Optional
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
JWT_SECRET=your-secret-key
```

### Firebase Setup (Optional)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Copy your config to `src/firebase/config.js`

---

## 📱 Usage

### For Personal Users
1. Sign up/login with your details
2. Set your last period date and cycle length
3. Log symptoms daily
4. Chat with Utaura AI for personalized advice
5. Track sleep, stress, and workouts
6. Generate health reports

### For Employees
1. Login with employee credentials
2. Access Work Wellness for productivity tips
3. Use Direct Comm Link for secure messaging
4. All features available to personal users

### For HR/Monitors
1. Access anonymized aggregate data
2. View workforce wellness trends
3. No access to individual user data

---

## 🔒 Privacy & Security

- **Data Ownership** - Users own their data
- **Anonymization** - HR/Monitors see only aggregate data
- **Local Storage** - Sensitive data stays on device
- **API Security** - Backend proxy protects API keys
- **No Tracking** - No third-party analytics

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for GPT-4 API
- [Firebase](https://firebase.google.com) for backend services
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide](https://lucide.dev) for beautiful icons
- All contributors and users ❤️

---

<div align="center">

**Made with 💕 for menstrual health awareness**

[Report Bug](https://github.com/yourusername/cuterus/issues) • [Request Feature](https://github.com/yourusername/cuterus/issues)

</div>
