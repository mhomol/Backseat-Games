const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const buildNumber =
    process.env.IOS_BUILD_NUMBER?.trim() || appJson.expo.ios?.buildNumber || '1';

  return {
    expo: {
      ...appJson.expo,
      ios: {
        ...appJson.expo.ios,
        buildNumber,
      },
    },
  };
};
