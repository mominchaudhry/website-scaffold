const HEX_PATTERN = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$";

export default {
  register(app) {
    app.customFields.register({
      name: "hex-color",
      type: "string",
      intlLabel: {
        id: "website-scaffold.hex-color.label",
        defaultMessage: "Color",
      },
      intlDescription: {
        id: "website-scaffold.hex-color.description",
        defaultMessage: "Pick a color and edit the HEX value manually.",
      },
      components: {
        Input: async () =>
          import("./components/HexColorFieldInput").then((module) => ({
            default: module.HexColorFieldInput,
          })),
      },
      options: {
        advanced: [
          {
            intlLabel: {
              id: "website-scaffold.hex-color.options.regex.label",
              defaultMessage: "RegExp pattern",
            },
            name: "regex",
            type: "text",
            defaultValue: HEX_PATTERN,
            description: {
              id: "website-scaffold.hex-color.options.regex.description",
              defaultMessage: "Regular expression used for HEX validation.",
            },
          },
          {
            sectionTitle: {
              id: "global.settings",
              defaultMessage: "Settings",
            },
            items: [
              {
                name: "required",
                type: "checkbox",
                intlLabel: {
                  id: "website-scaffold.hex-color.options.required.label",
                  defaultMessage: "Required field",
                },
                description: {
                  id: "website-scaffold.hex-color.options.required.description",
                  defaultMessage: "This field must be filled before saving.",
                },
              },
            ],
          },
        ],
      },
    });
  },
  config: {
    locales: [],
  },
};
