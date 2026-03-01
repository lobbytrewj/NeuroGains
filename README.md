## NeuroGains v1.0 | AI-Powered Hypertrophy Optimization System

An advanced neural-feedback training application that analyzes real-time biometric data to optimize hypertrophy training. This project features a React frontend with real-time data visualization and a Supabase backend for session tracking and analytics.

## Overview

NeuroGains uses neural stability tracking, tremor analysis, and velocity-based training metrics to help athletes maximize muscle growth by identifying optimal training zones and preventing premature failure. The application provides live feedback during workouts and comprehensive post-session analytics.

## Core Features

- **Real-Time Neural Tracking**: Monitor stability, tremor frequency, and fatigue during training sessions
- **Hypertrophy Zone Detection**: Automatically identifies when athletes reach the optimal 8-12Hz tremor frequency zone
- **Intelligent Rep Counting**: Analyzes velocity loss, jitter patterns, and stability changes to count reps automatically
- **Final Rep Alert System**: Multi-parameter algorithm predicts imminent failure and alerts athletes
- **Session Analytics Dashboard**: View historical performance, stability trends, and hypertrophy efficiency scores
- **Deep Dive Analysis**: Detailed post-session reports with time-series data and failure point snapshots

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | Lucide React (icons), Framer Motion (animations), Recharts (data visualization) |
| **Backend** | Supabase (PostgreSQL, Real-time subscriptions) |
| **Routing** | React Router v7 |
| **State Management** | React Hooks (useState, useEffect, useRef) |
| **Video Processing** | MediaPipe Pose (for future integration) |

## Prerequisites

Before you begin, ensure you have the following installed and configured:

### Development Environment
- **Node.js (v18+) & npm**: Required to run the React frontend
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, or Edge with WebSocket support
- **IDE**: VS Code (Recommended) with ESLint and TypeScript extensions

### Supabase Setup
A Supabase project with:
- PostgreSQL database instance
- Project URL and anonymous key
- Database migrations applied

## Setup & Installation

### Frontend

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neurogains
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Database Setup

The application uses Supabase PostgreSQL with the following schema:

## Project Structure

```
neurogains/
├── src/
│   ├── components/          # React components
│   │   ├── BiometricPanel.tsx
│   │   ├── FatigueGauge.tsx
│   │   ├── FinalRepAlert.tsx
│   │   ├── HypertrophyScoreCard.tsx
│   │   ├── HypertrophyZoneIndicator.tsx
│   │   ├── NeuralStabilityChart.tsx
│   │   ├── NeuralVideoFeed.tsx
│   │   └── SessionDeepDive.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAudioAlert.ts
│   │   ├── useMockNeuroData.ts
│   │   ├── useNeuroStream.ts
│   │   └── useRepAnalyzer.ts
│   ├── lib/                 # Utilities and configurations
│   │   └── supabase.ts
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   └── TrainerPage.tsx
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── supabase/
│   └── migrations/         # Database migration files
├── public/                 # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Key Components

### Pages

**HomePage** (`src/pages/HomePage.tsx`)
- Dashboard displaying session statistics
- Recent sessions list with click-to-analyze functionality
- Session deep dive modal for detailed analytics

**TrainerPage** (`src/pages/TrainerPage.tsx`)
- Live training interface with real-time biometric feedback
- Session recording and management
- Calibration system for baseline stability
- Final rep alert integration

**useRepAnalyzer** (`src/hooks/useRepAnalyzer.ts`)
- Advanced rep detection algorithm
- Velocity loss calculation
- Hypertrophy zone analysis
- Final rep prediction using multi-parameter model

**useNeuroStream** (`src/hooks/useNeuroStream.ts`)
- WebSocket connection to neural data backend
- Real-time data streaming and parsing
- Automatic reconnection handling

**useMockNeuroData** (`src/hooks/useMockNeuroData.ts`)
- Simulated neural data generator for development
- Fatigue progression modeling

**useAudioAlert** (`src/hooks/useAudioAlert.ts`)
- Audio notification system
- Final rep and success sound effects

### Components

**SessionDeepDive** (`src/components/SessionDeepDive.tsx`)
- Comprehensive post-session analysis
- Time-series stability charts
- Rep-by-rep breakdown
- Failure point snapshots

**NeuralStabilityChart** (`src/components/NeuralStabilityChart.tsx`)
- Real-time line chart of neural stability
- Baseline comparison visualization

**FatigueGauge** (`src/components/FatigueGauge.tsx`)
- Radial gauge showing current fatigue level
- Jitter frequency indicator

**HypertrophyZoneIndicator** (`src/components/HypertrophyZoneIndicator.tsx`)
- Progress bar showing proximity to optimal training zone
- Color-coded feedback

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

## Core Algorithms

### Rep Detection Algorithm
Analyzes stability changes to detect rep phases:
1. Monitors stability fluctuations exceeding threshold (5%)
2. Tracks rep phase duration (minimum 500ms)
3. Validates rep completion before incrementing counter

### Final Rep Prediction
Multi-parameter model using:
- Velocity loss relative to first rep (≥40% threshold)
- Tremor frequency elevation (≥8Hz)
- Non-linear jitter pattern detection
- Decreasing velocity trend across last 3 reps
- Hypertrophy progress zone (≥85%)

Triggers alert when 3+ critical conditions are met.

### Hypertrophy Efficiency Score
Calculated as:
```
Efficiency = (Hypertrophy Reps / Total Reps) × 100
Velocity Bonus = min(20, Avg Velocity Loss × 50)
Final Score = min(100, Efficiency + Velocity Bonus)
```
## Research Articles Used
https://www.semanticscholar.org/paper/Effects-of-velocity-loss-during-resistance-training-Pareja-Blanco-Rodr%C3%ADguez-Rosell/faa6ca3add9391ecc8cb9a07973a07333fbaf921#:~:text=Pareja%2DBlancoJulian%20Alcazar%20%2B7,Highly%20Influenced

## Future Enhancements

- **MediaPipe Integration**: Real-time pose estimation and form analysis
- **Progressive Overload Tracking**: Long-term strength and volume progression
- **Multi-Exercise Support**: Exercise-specific calibration and tracking
- **Mobile Application**: React Native port for on-the-go training
- **Social Features**: Share sessions and compete with training partners
- **AI-Powered Coaching**: Personalized training recommendations based on historical data

