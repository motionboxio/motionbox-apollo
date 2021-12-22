import axios from "axios";

export default async () => {
  try {
    const { data } = await axios.post(
      `https://app.apollo.io/api/v1/mixed_people/search?api_key=${process.env.APOLLO_API_KEY}`,
      {
        contact_label_ids: ["61c0d951a4aeb500010f12ea"],
        // not_exist_typed_custom_fields: ["61c0f418f8744300f6151de6"],
        per_page: 25,
      },
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    return data.contacts;
  } catch (e: any) {
    console.log({
      error: e.response.data,
    });

    throw new Error(e.response.data);
  }
};
