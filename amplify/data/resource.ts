import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Boxes: a
    .model({
      boxID: a.id().required(),
      itemID: a.string().required(),
      boxName: a.string(),
      itemName: a.string(),
      location: a.string(),
      quantity: a.float(),
      note: a.string(),
    })
    .identifier(['boxID', 'itemID'])
    .authorization((allow) => [allow.publicApiKey()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});