module.exports = ({ env }) => {
  const hasS3Config = Boolean(env("S3_BUCKET"));

  return {
    upload: hasS3Config
      ? {
          config: {
            provider: "aws-s3",
            providerOptions: {
              s3Options: {
                credentials: {
                  accessKeyId: env("S3_ACCESS_KEY_ID"),
                  secretAccessKey: env("S3_ACCESS_SECRET"),
                },
                region: env("S3_REGION", "us-east-1"),
                endpoint: env("S3_ENDPOINT", undefined),
                forcePathStyle: env.bool("S3_FORCE_PATH_STYLE", false),
              },
              params: {
                Bucket: env("S3_BUCKET"),
              },
            },
            actionOptions: {
              upload: {},
              uploadStream: {},
              delete: {},
            },
          },
        }
      : {
          config: {
            sizeLimit: 250 * 1024 * 1024,
          },
        },
  };
};
