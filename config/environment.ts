export default function environmentConfig(environment: string) {
  let projectName = 'bluejay';

  let config = {
    environment,
    server: {
      port: process.env.PORT || 3000,
      domain: `http://localhost:${process.env.PORT || 3000}`,
    },
    // bugsnag: {
    // key: process.env.BUGSNAG_API_KEY,
    // releaseStage: process.env.BUGSNAG_RELEASE_STAGE
    // },
    ormAdapter: 'objection',
    slack: {
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
    },
    botkit: {
      scopes: ['bot'],
      // debug: false
      enableRtm: true,
      storage: '',
      database: {},
    },
    database: {
      client: 'pg',
      // debug: true,
      connection: <any>{
        host: 'localhost',
        user: 'postgres',
        database: `${projectName}-api_dev`,
      },
    },
    migrations: {
      db: {
        client: '',
        connection: <any>{
          host: '',
          user: '',
          database: `${projectName}-api_dev`,
        },
      },
      connection: '',
    },
    'denali-jwt': {},
    jwt: {
      // TODO: Set this on an env var
      secret: 'c14e918a-d339-4d8a-9bf3-d4521a958d23',
    },
    mixpanel: {
      enabled: environment === 'production',
      token: process.env.MIXPANEL_TOKEN,
      apiKey: process.env.MIXPANEL_API_KEY,
    },
    stripe: {
      key: process.env.STRIPE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      currency: 'USD',
      statementDescriptor: 'Bluejay',
    },
  };

  config.migrations = {
    db: config.database,
    connection: '',
  };

  if (environment === 'development') {
    // development-specific config
  }

  if (environment === 'production') {
    config.database.connection = config.migrations.db.connection = process.env.DATABASE_URL;
    config.server.domain = 'https://api.bluejay.com';
  }

  config['denali-jwt'] = Object.assign(config['denali-jwt'], {
    issuer: config.server.domain,
    secret: config.jwt.secret,
  });

  return config;
}
