import axios from "axios";

export default async () => {
  try {
    const { data } = await axios.post(
      `https://app.apollo.io/api/v1/mixed_people/search?api_key=${process.env.APOLLO_API_KEY}`,
      {
        contact_label_ids: ["61c0d951a4aeb500010f12ea"],
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
