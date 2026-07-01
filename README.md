# Iron & B12 Tracker

A personal health tracking app for monitoring iron and B12-related labs, symptoms, medications, and daily wellness. Built with Expo and React Native.

All data is stored **locally on your device** — there is no account, cloud sync, or server. You can export CSV files or a full JSON backup from Settings at any time.

## Features

- **Home dashboard** — today's symptoms, medications due, and recent lab results at a glance
- **Symptoms** — log fatigue, brain fog, tingling, mood, sleep, and more; view trends over time
- **Medications** — track supplements and prescriptions with morning / afternoon / evening slots and optional reminders
- **Lab results** — record ferritin, B12, hemoglobin, and custom tests with reference ranges and trend charts
- **Reports & insights** — 7- and 30-day symptom averages, medication adherence, and lab trends
- **Period tracker** — log flow, cycle predictions, and symptom correlation
- **Food journal** — meal notes for nutrition tracking
- **Notes** — tagged journal entries for qualitative observations
- **Profile** — name, baseline labs, and medication list
- **Settings** — light / dark / system theme, US or metric units, export, and backup restore

## Requirements

To run the app from source you need:

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)
- A phone or emulator for testing

For the quickest way to try the app on your phone, install [Expo Go](https://expo.dev/go) on iOS or Android.

## Getting started (development)

1. **Clone the repository**

   ```bash
   git clone https://github.com/runnergirlreads/iron-b12-tracker.git
   cd iron-b12-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Open the app**
   - Press `i` to open the iOS Simulator (macOS with Xcode only)
   - Press `a` to open an Android emulator
   - Press `w` to open in a web browser

## Installing on your device

### Option 1: Expo Go (fastest — try it in minutes)

Best for exploring the app during development. No build step required.

1. Install **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android).
2. Clone the repo and run `npm install` and `npx expo start` on your computer (see above).
3. Make sure your phone and computer are on the **same Wi-Fi network**.
4. Scan the QR code shown in the terminal:
   - **iOS** — open the Camera app and tap the banner that appears
   - **Android** — tap **Scan QR code** inside Expo Go

The app loads inside Expo Go. Your data is saved on the device running Expo Go.

> **Note:** Expo Go shows the Expo Go icon on your home screen, not the Iron & B12 Tracker icon. Medication reminders and other native features work, but this is intended for development and personal testing rather than a polished App Store install.

### Option 2: Standalone app on your phone (home-screen icon)

To install Iron & B12 Tracker as its own app with the custom icon and splash screen, create a native build with [EAS Build](https://docs.expo.dev/build/introduction/):

1. **Install the EAS CLI**

   ```bash
   npm install -g eas-cli
   ```

2. **Log in to Expo**

   ```bash
   eas login
   ```

3. **Configure the project** (first time only)

   ```bash
   eas build:configure
   ```

4. **Build for your device**

   ```bash
   # iOS (requires an Apple Developer account for device installs)
   eas build --platform ios --profile preview

   # Android (installable APK)
   eas build --platform android --profile preview
   ```

5. When the build finishes, open the link EAS provides to download and install the app on your device.

For detailed platform-specific steps (signing certificates, internal distribution, TestFlight, etc.), see the [Expo distribution docs](https://docs.expo.dev/build/setup/).

### Option 3: iOS Simulator or Android Emulator

If you have Xcode or Android Studio installed:

```bash
npx expo start
```

Then press `i` (iOS Simulator) or `a` (Android emulator) in the terminal.

## Using the app

1. Open **Profile** (More tab) to add your name, medications, and baseline lab values.
2. Log **symptoms** daily from the Symptoms tab or the Home dashboard.
3. Mark medications as taken on the Medications tab or Home screen.
4. Add **lab results** when you get blood work — attach a photo of results if helpful.
5. Check **Reports** (More tab) for trends over the past week or month.
6. Enable **medication reminders** in Settings if you want daily alerts at 8 AM, 1 PM, and 8 PM.

## Backup and export

In **Settings → Data**:

- **Export CSV** — spreadsheet-friendly export of your data
- **Export backup** — full JSON backup of everything
- **Restore backup** — replace current data from a previous backup file

Because data lives only on your device, export a backup before switching phones or reinstalling.

## Tech stack

- [Expo](https://expo.dev/) SDK 54
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) for local persistence

## Disclaimer

This app is for personal wellness tracking only. It is not medical advice and does not replace consultation with a healthcare provider. Reference ranges are general guides — your clinician may use different targets.

## License

This project is provided as-is for personal use. See the repository for license details.
