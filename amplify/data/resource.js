import { a, defineData } from "@aws-amplify/backend";
/*== STEP 1 ===============================================================
The section below creates a Boxes database table with a "boxID" field. The
authorization rule below specifies that any user authenticated via an API key
can "create", "read", "update", and "delete" any "Boxes" records.
=========================================================================*/
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