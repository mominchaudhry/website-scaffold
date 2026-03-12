const path = require("path");

module.exports = ({ env }) => {
  const client = env("DATABASE_CLIENT", "postgres");

  const connections = {
    postgres: {
      connection: {
        connectionString: env("DATABASE_URL"),
        ssl: env.bool("DATABASE_SSL", false)
          ? {
              rejectUnauthorized: env.bool("DATABASE_SSL_REJECT_UNAUTHORIZED", false),
            }
          : false,
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, "..", ".tmp", "data.db"),
      },
      useNullAsDefault: true,
    },
  };

  const selected = connections[client] || connections.postgres;

  return {
    connection: {
      client,
      ...selected,
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  };
};
