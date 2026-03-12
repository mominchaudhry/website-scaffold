const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::site-config.site-config', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
