
# Shifa Application

## Project Overview

This is a cross-platform mobile application built with **React Native** and **Expo**, designed to provide mental health and well-being support. The application serves various user roles, including general users, volunteers, admins, and super-admins, each with a tailored experience.

### Key Technologies

- **Frontend:** React Native, Expo
- **Navigation:** React Navigation
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Styling:** Standard React Native stylesheets

### Core Features

- **User Authentication:** Secure sign-up and login for different user roles.
- **Journaling:** A private space for users to record their thoughts and feelings.
- **Resource Center:** Access to articles, videos, and contact information for professional help.
- **Event Management:** Admins can create and manage events, and users can register for them.
- **Volunteer Opportunities:** A dedicated section for volunteers to find and apply for opportunities.
- **Admin Dashboard:** A comprehensive dashboard for admins to manage users, events, and resources.

## Deployment Plan

### 1. Environment Setup

Before deploying the application, ensure that your environment is properly configured.

- **Node.js:** Make sure you have the latest LTS version of Node.js installed.
- **Expo CLI:** Install the Expo CLI globally by running:
  ```bash
  npm install -g expo-cli
  ```
- **Firebase Project:** Set up a Firebase project and obtain the necessary configuration keys.

### 2. Configuration

- **Firebase:** Create a `.env` file in the root of the project and add your Firebase project credentials. This file is included in the `.gitignore` to prevent your keys from being committed to version control.

  ```
  EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
  EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
  EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
  ```

### 3. Web Deployment

The application can be deployed as a web app, which is ideal for quick access and for users who prefer not to download a mobile app.

- **Build:** Generate the static web build by running:
  ```bash
  expo export:web
  ```
- **Hosting:** The output will be in the `dist` directory, which you can then deploy to any static hosting service like **Firebase Hosting**, **Vercel**, or **Netlify**.

### 4. Mobile Deployment

To deploy the app to mobile devices, you can build standalone binaries for both Android and iOS.

- **Android:**
  - **Build:**
    ```bash
    eas build -p android --profile preview
    ```
  - **Distribution:** The build will be available in your EAS account, from where you can download the APK or AAB and upload it to the **Google Play Store**.

- **iOS:**
  - **Build:**
    ```bash
    eas build -p ios --profile preview
    ```
  - **Distribution:** The iOS build will also be available in your EAS account. From there, you can submit it to the **Apple App Store** through TestFlight for testing and final release. 