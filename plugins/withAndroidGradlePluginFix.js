const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      // Add a log to confirm the plugin is running
      console.log("Applying withAndroidGradlePluginFix: Attempting to remove 'enableBundleCompression' from app/build.gradle");

      const lines = config.modResults.contents.split('\n');
      const filteredLines = lines.filter(line => !line.includes('enableBundleCompression'));
      config.modResults.contents = filteredLines.join('\n');
    }
    return config;
  });
};