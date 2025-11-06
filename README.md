# Name2Face App

A mobile and web application built with React Native and Expo to help you remember people's names and associated details.

## Purpose

Ever meet someone important and struggle to recall their name or key details later? Name2Face aims to solve this common problem. It provides a straightforward interface to quickly log information about people you encounter, making it easier to build and maintain connections.

This app allows you to:

*   Quickly add people you meet with their names
*   Add detailed information including gender, tags, and memory hooks
*   Search for people using names, tags, gender, or notes
*   Full-text search on memory hooks (native platforms only)
*   Work offline on iOS and Android with automatic sync when online
*   Categorize entries using quick tags (Work, Social, Event, Service, Hobby) or custom tags

## Target Platforms

*   iOS
*   Android  
*   Web

## Technology Stack

*   **React Native** with **Expo**
*   **TypeScript** for type safety
*   **Firebase** for backend services:
    *   Firebase Authentication (Email/Password)
    *   Cloud Firestore for data storage
    *   Firebase Storage for photos (infrastructure ready)
*   **React Navigation** for navigation
*   **FlexSearch** for client-side full-text search (native only)
*   **Jest** and **React Native Testing Library** for testing

## Features

### V1 Implementation

- ✅ Email/Password Authentication
- ✅ Quick Add - Rapidly save a person with just their name
- ✅ Full Details - Add comprehensive information including gender, tags, and notes
- ✅ Smart Search - Search by name, gender, tags, or memory hooks with relevance scoring
- ✅ Offline Support - Works offline on iOS/Android with automatic sync
- ✅ Platform-Specific Features:
  - Native (iOS/Android): Client-side full-text search, offline persistence
  - Web: Online-only, basic keyword search
- ✅ Duplicate Detection - Warns when adding duplicate names
- ✅ CRUD Operations - Create, read, update, and delete person records

### Future Enhancements

- ⏳ Photo Upload/Display
- ⏳ Voice-to-Text for memory hooks (native only)
- ⏳ Google Sign-in
- ⏳ Apple Sign-in

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   Expo CLI (`npm install -g expo-cli`)
*   For iOS: Xcode (Mac only)
*   For Android: Android Studio

### Installation

1. Clone the repository:
```bash
git clone https://github.com/name2face/app.git
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Follow the instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Create a `.env` file with your Firebase configuration

### Running the Application

#### Web
```bash
npm run web
```

#### iOS (requires Mac with Xcode)
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Development Mode
```bash
npm start
```
Then press `w` for web, `i` for iOS, or `a` for Android.

### Running Tests

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test:watch
```

### Building for Production

See [Expo documentation](https://docs.expo.dev/build/introduction/) for building production apps.

## Project Structure

```
app/
├── src/
│   ├── components/      # Reusable UI components
│   ├── config/          # Configuration files
│   ├── contexts/        # React contexts (Auth, Data)
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   ├── services/        # Business logic and API calls
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── __tests__/           # Test files
├── assets/              # Static assets (images, fonts)
├── App.tsx              # Root component
├── FIREBASE_SETUP.md    # Firebase setup instructions
├── SPECIFICATION.md     # Detailed app specification
└── DEVELOPMENT.md       # Development notes
```

## Documentation

*   [SPECIFICATION.md](./SPECIFICATION.md) - Detailed feature specifications
*   [DEVELOPMENT.md](./DEVELOPMENT.md) - Development plans and technical decisions
*   [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration guide

## Status

V1 core features are implemented and functional. The app includes authentication, full CRUD operations, search functionality with relevance scoring, and offline support for native platforms.

## Contributing

This is a personal project, but suggestions and feedback are welcome through GitHub issues.

## License

MIT License - see LICENSE file for details (to be added)
