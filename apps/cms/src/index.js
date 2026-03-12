const { revalidateForEntry } = require("./utils/revalidate");
const { seedDefaultContent } = require("./utils/seed-default-content");

function shouldRevalidateModel(model) {
  return typeof model === "string" && model.startsWith("api::");
}

function getLifecycleResult(event) {
  const result = event?.result;

  if (Array.isArray(result)) {
    return result[0] || null;
  }

  if (result && typeof result === "object" && Array.isArray(result.entries)) {
    return result.entries[0] || null;
  }

  return result || event?.params?.data || null;
}

async function handleLifecycle(event, action) {
  const model = event?.model?.uid;
  if (!shouldRevalidateModel(model)) {
    return;
  }

  await revalidateForEntry({
    model,
    action,
    result: getLifecycleResult(event),
    params: event?.params || null,
  });
}

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: "hex-color",
      type: "string",
    });
  },

  async bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      async afterCreate(event) {
        await handleLifecycle(event, "afterCreate");
      },
      async afterUpdate(event) {
        await handleLifecycle(event, "afterUpdate");
      },
      async afterDelete(event) {
        await handleLifecycle(event, "afterDelete");
      },
    });

    await seedDefaultContent(strapi);
  },
};
