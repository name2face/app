# Firebase Setup Instructions

This application uses Firebase for backend services (Authentication, Firestore, Storage). Follow these steps to configure Firebase for your project.

## Prerequisites

1. A Google account
2. Node.js and npm installed
3. Expo CLI installed (`npm install -g expo-cli`)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "name2face-app")
4. Follow the setup wizard to create your project

## Step 2: Enable Firebase Services

### Enable Authentication

1. In the Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** authentication
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Enable Firestore Database

1. In the Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
   - **Important**: Update security rules before deploying to production
4. Select a location for your database
5. Click "Enable"

### Enable Storage

1. In the Firebase Console, go to **Build > Storage**
2. Click "Get started"
3. Choose "Start in test mode" (for development)
   - **Important**: Update security rules before deploying to production
4. Click "Done"

## Step 3: Configure Firebase for Web

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`) to add a web app
4. Register the app with a nickname (e.g., "Name2Face Web")
5. Copy the Firebase configuration object

6. Create a `.env` file in the project root with your Firebase config:

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Step 4: Configure Firebase for iOS (Optional)

1. In the Firebase Console, click "Add app" and select iOS
2. Enter your iOS bundle ID (from `app.json`)
3. Download `GoogleService-Info.plist`
4. Place the file in the iOS project folder
5. Follow Firebase setup instructions for iOS

## Step 5: Configure Firebase for Android (Optional)

1. In the Firebase Console, click "Add app" and select Android
2. Enter your Android package name (from `app.json`)
3. Download `google-services.json`
4. Place the file in the Android project folder (`android/app/`)
5. Follow Firebase setup instructions for Android

## Step 6: Set Up Firestore Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own persons
    match /persons/{personId} {
      allow read, write: if request.auth != null && 
                         request.resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 7: Set Up Storage Security Rules

For production, update your Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{userId}/{personId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 8: Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

## Step 9: Run the Application

### Web
```bash
npm run web
```

### iOS (requires Mac)
```bash
npm run ios
```

### Android
```bash
npm run android
```

## Troubleshooting

### "Firebase not initialized" error
- Ensure your `.env` file is properly configured
- Check that all Firebase services are enabled in the console
- Restart the development server

### Authentication not working
- Verify Email/Password authentication is enabled in Firebase Console
- Check that your Firebase API key is correct

### Firestore permission denied
- Ensure you're signed in with a valid user
- Check Firestore security rules
- Verify the userId field is properly set on documents

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/)
