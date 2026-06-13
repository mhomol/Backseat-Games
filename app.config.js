/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const buildNumber = process.env.IOS_BUILD_NUMBER?.trim() || '1';

  return {
    expo: {
      name: 'Backseat Games',
      slug: 'backseat-games',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/icon.png',
      userInterfaceStyle: 'light',
      scheme: 'backseatgames',
      newArchEnabled: true,
      splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#5CB9E0',
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.homolworks.backseatgames',
        buildNumber,
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
          NSLocalNetworkUsageDescription:
            'Backseat Games uses the local network to connect phones in the same car for multiplayer games.',
          NSBonjourServices: ['_backseatgames._tcp'],
          NSMicrophoneUsageDescription:
            'Backseat Games uses the microphone when you say a word aloud in the Sign Game (optional voice input).',
          NSSpeechRecognitionUsageDescription:
            'Backseat Games converts your spoken word to text in the Sign Game when voice input is enabled.',
          NSPhotoLibraryUsageDescription:
            'Backseat Games does not access your photos. This notice is required because an included speech library references photo access APIs.',
          NSUserNotificationsUsageDescription:
            'Backseat Games may send alerts when a host starts a game or when it is your turn.',
          UIBackgroundModes: ['remote-notification'],
        },
      },
      android: {
        adaptiveIcon: {
          backgroundColor: '#5CB9E0',
          foregroundImage: './assets/android-icon-foreground.png',
          backgroundImage: './assets/android-icon-background.png',
          monochromeImage: './assets/android-icon-monochrome.png',
        },
        predictiveBackGestureEnabled: false,
        package: 'com.homolworks.backseatgames',
      },
      web: {
        favicon: './assets/favicon.png',
      },
      plugins: [
        'expo-router',
        'expo-font',
        'expo-splash-screen',
        'expo-asset',
        'expo-audio',
        [
          'expo-notifications',
          {
            color: '#5CB9E0',
          },
        ],
        'expo-iap',
        [
          'expo-speech-recognition',
          {
            microphonePermission:
              'Backseat Games uses the microphone when you say a word aloud in the Sign Game.',
            speechRecognitionPermission:
              'Backseat Games converts your spoken word to text in the Sign Game.',
          },
        ],
      ],
      experiments: {
        tsconfigPaths: true,
      },
      extra: {
        router: {},
        eas: {
          projectId: '3760b2e7-04b8-4d7f-b7c1-b6b21e65c387',
        },
      },
      owner: 'sevign',
    },
  };
};
