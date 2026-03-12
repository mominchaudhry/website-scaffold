const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::page.page', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
