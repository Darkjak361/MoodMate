# MoodMate: User Stories & Acceptance Criteria

**Course:** CPAN-324-0NA | **Project:** MoodMate | **Phase:** 2 Final Submission (Infrastructure Hardened)

## 🧘 User Persona: The Mindful Student
> *"As a busy college student, I want a simple way to track my stress levels and receive brief, non-judgmental encouragement so that I can stay emotionally balanced during exams."*

### Story 1: Intelligent Mood Analysis
**As a user**, I want to type my thoughts and have the AI understand my underlying sentiment.
- **Criteria 1**: System correctly identifies POSITIVE, NEUTRAL, or NEGATIVE sentiment from natural language.
- **Criteria 2**: System provides a context-aware insight (e.g., "It's okay to feel stressed") rather than just a score.

### Story 2: Daily Engagement & Inspiration
**As a user**, I want to see something uplifting when I open the app without needing to log a mood first.
- **Criteria 1**: A "Daily Inspiration" card is visible on the Dashboard.
- **Criteria 2**: The card provides a mix of quotes and calming activities.

### Story 3: Privacy & Data Sovereignty
**As a user**, I want to be able to delete my account and all my data securely.
- **Criteria 1**: Account deletion requires password confirmation.
- **Criteria 2**: All associated mood logs and settings are permanently removed from the database.

### Story 4: Immediate Emotional Support (100% Universal)
**As a user**, I want a non-verbal tool to help me calm down when I am feeling overwhelmed.
- **Criteria 1**: A "Calm Breath" tool is accessible from the Dashboard with pulsating visuals.
- **Criteria 2**: A "Calm Sound" button launches a high-quality relaxation video (YouTube App recommended for 100% mobile fidelity). 🎵🎬 ✅

### Story 5: Accessibility & Voice Input (Smart-Mic Strategy)
**As a user**, I want to speak my thoughts instead of typing when I am on the go.
- **Criteria 1**: A professional "Smart-Mic" system is available on the logging screen.
- **Criteria 2**: System uses Web Speech API (Web) or System Keyboard Dictation (Mobile) to ensure **100% crash-proof** performance on all devices. 🎤📱 ✅

### Story 6: Adaptive Empathy (Advanced Personalization)
**As a user**, I want the app to acknowledge if I've been having a tough few days.
- **Criteria 1**: AI detects 3-day negative trends in mood history.
- **Criteria 2**: Feedback becomes deeply empathetic and personalized to the trend.

---

## 🏗️ Stakeholder Persona: The Academic Evaluator
> *"As a professor, I want to see clear system documentation and professional UI/UX standards so that the project meets capstone-ready industry requirements."*

### Story 7: Professional UX Layout
**As a stakeholder**, I want a clean, minimalist interface with standard navigation patterns.
- **Criteria 1**: "Logout" is located in the global header for easy access.
- **Criteria 2**: Font sizes and spacing (16pt/600) ensure an uncluttered, professional aesthetic.

### Story 5: Technical Transparency
**As a stakeholder**, I want to understand the system architecture and AI model logic.
- **Criteria 1**: README contains a visual Mermaid diagram of the tech stack.
- **Criteria 2**: AI ethics and model explanations are documented for transparency.

### Story 8: System Resilience & 24/7 Uptime (The Unstoppable Engine)
**As a stakeholder**, I want the backend to be "unstoppable" so that the app never crashes during a presentation or real-world use.
- **Criteria 1**: Implement a **"Professional Safety Shield"** (Global Error Handling) to catch and log all "Ghost Crashes" without the process exiting.
- **Criteria 2**: Use **Cloudflare Tunneling** to ensure the Expo app can reach the backend 100% of the time, regardless of local network restrictions.

### Story 9: Industrial Scalability (1,000+ Users)
**As a stakeholder**, I want the app to handle a large volume of concurrent users without performance degradation.
- **Criteria 1**: The system is architected using Node.js/Express non-blocking I/O to support **at least 1,000 simultaneous users**.
- **Criteria 2**: The MongoDB Atlas data layer ensures sub-second response times even with **100,000+ mood entries** in the system.
