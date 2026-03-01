# NeuroGains

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

#### Sessions Table
Stores workout session data with comprehensive metrics:

```sql
sessions
├── id (uuid, primary key)
├── user_id (uuid, nullable)
├── start_time (timestamptz)
├── end_time (timestamptz)
├── duration_seconds (integer)
├── average_stability (numeric)
├── min_stability (numeric)
├── max_stability (numeric)
├── peak_fatigue (numeric)
├── total_reps (integer)
├── hypertrophy_reps (integer)
├── hypertrophy_efficiency_score (numeric)
├── avg_velocity_loss (numeric)
├── peak_tremor_avg (numeric)
└── created_at (timestamptz)
```

#### Migration Files
- `20260301024600_fix_sessions_table_for_anonymous_use.sql` - Enables public access for demo purposes
- `20260301030354_add_rep_tracking_to_sessions.sql` - Adds rep-level hypertrophy tracking fields

To apply migrations, use the Supabase CLI or dashboard to run the SQL files in the `supabase/migrations/` directory.

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

### Custom Hooks

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

### Development Mode

The application supports both live neural data (via WebSocket) and mock data modes:

- **Live Mode**: Connects to WebSocket server at `ws://localhost:8000/neuro-stream`
- **Mock Mode**: Automatically falls back to simulated data when WebSocket is unavailable

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

## Database Security

Current configuration uses public access for demo purposes. For production:

1. **Enable user authentication** using Supabase Auth
2. **Update RLS policies** to restrict access:
   ```sql
   CREATE POLICY "Users can view own sessions"
     ON sessions FOR SELECT
     TO authenticated
     USING (auth.uid() = user_id);
   ```
3. **Require authenticated users** for all operations
4. **Add user_id validation** in application logic

## Future Enhancements

- **MediaPipe Integration**: Real-time pose estimation and form analysis
- **Progressive Overload Tracking**: Long-term strength and volume progression
- **Multi-Exercise Support**: Exercise-specific calibration and tracking
- **Mobile Application**: React Native port for on-the-go training
- **Social Features**: Share sessions and compete with training partners
- **AI-Powered Coaching**: Personalized training recommendations based on historical data

## Performance Considerations

- Session data is buffered in memory during active sessions
- Real-time charts use windowed data to maintain performance
- Database queries are optimized with indexes on `created_at` and `user_id`
- WebSocket reconnection uses exponential backoff

## Troubleshooting

### WebSocket Connection Issues
- Verify backend server is running on port 8000
- Check firewall settings allow WebSocket connections
- Application automatically falls back to mock data mode

### Database Connection Issues
- Verify `.env` contains correct Supabase credentials
- Check Supabase project is active and accessible
- Review browser console for specific error messages

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Verify Node.js version is 18 or higher: `node --version`
- Run type checking to identify TypeScript issues: `npm run typecheck`

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow existing code style and conventions
4. Add TypeScript types for all new code
5. Test thoroughly before submitting pull request
6. Update documentation as needed

## License

This project is proprietary software. All rights reserved.

## Contact

For questions, issues, or feature requests, please open an issue on the repository or contact the development team.

---

**NeuroGains v2.0** | AI-Powered Hypertrophy Optimization System
