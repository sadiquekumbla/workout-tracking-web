# Workout Tracking Web Application

A modern web application for tracking workouts, built with Next.js, Firebase, and DeepSeek AI. The application allows users to log workouts manually or extract workout information from images using AI.

## Features

- Log workouts manually with exercise name, sets, reps, and weight
- Extract workout information from images using AI
- View workout history with details for each workout
- Track progress and total weight lifted
- Add multiple workouts at once
- Mark workouts as completed
- Modern UI using Shadcn UI components
- Data persistence using Firebase

## Prerequisites

- Node.js 18+ and npm
- Firebase account
- DeepSeek API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd workout-tracking-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Firebase and DeepSeek API credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Adding a Workout**
   - Click "Add Exercise" to add a new exercise
   - Fill in the exercise name, number of reps, and weight for each set
   - Add more sets using the "Add Set" button
   - Add notes if needed
   - Click "Save Workout" to save the workout

2. **Extracting Workout from Image**
   - Upload an image of your workout
   - The AI will attempt to extract workout information
   - Review and edit the extracted information if needed
   - Save the workout

3. **Managing Workouts**
   - View your workout history
   - Mark workouts as completed
   - Delete workouts you no longer need

## Technologies Used

- Next.js 14
- TypeScript
- Firebase (Firestore)
- DeepSeek AI
- Shadcn UI
- Tailwind CSS
- date-fns

## Contributing

Feel free to submit issues and enhancement requests!
