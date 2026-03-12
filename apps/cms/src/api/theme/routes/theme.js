const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::theme.theme', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
