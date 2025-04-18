# Workout Tracking Web App

A modern web application for tracking your workouts and fitness progress. Built with Next.js, Firebase, and TypeScript.

## Features

- 🔐 Secure authentication with Firebase
- 📝 Track your workouts with detailed information
- 📊 View your workout history
- 🌙 Dark/Light mode support
- 📱 Responsive design for all devices
- ⚡ Fast and optimized performance

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Deployment:** GitHub Pages

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/sadiquekumbla/workout-tracking-web.git
   cd workout-tracking-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment process:

1. Builds the Next.js application
2. Generates static files
3. Deploys to GitHub Pages

Visit the live site at: https://sadiquekumbla.github.io/workout-tracking-web/

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
