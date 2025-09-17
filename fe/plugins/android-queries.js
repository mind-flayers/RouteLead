const { withAndroidManifest } = require('expo/config-plugins');

const withAndroidQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;

    // Ensure queries array exists
    if (!manifest.queries) {
      manifest.queries = [];
    }

    // Add phone call intent query
    const phoneCallQuery = {
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.DIAL' } }],
        },
      ],
    };

    // Check if the query already exists
    const existingQuery = manifest.queries.find((query) => 
      query.intent && 
      query.intent.some((intent) => 
        intent.action && 
        intent.action.some((action) => 
          action.$ && action.$['android:name'] === 'android.intent.action.DIAL'
        )
      )
    );

    if (!existingQuery) {
      manifest.queries.push(phoneCallQuery);
    }

    return config;
  });
};

module.exports = withAndroidQueries;
