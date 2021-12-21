import axios from "axios";

interface IUpdate {
  id: string;
  finalVideo: string;
}

export default async ({ id, finalVideo }: IUpdate) => {
  try {
    const { data } = await axios.post(
      `https://api.apollo.io/v1/contacts/${id}`,
      {
        api_key: process.env.APOLLO_API_KEY,
        typed_custom_fields: {
          "61c0f418f8744300f6151de6": finalVideo,
        },
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
