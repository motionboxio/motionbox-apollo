import axios from "axios";

const API_ENDPOINT =
  "http://microservice-staging.vercel.app/api/motionbox-render";

interface IRender {
  contact: any;
  videoId: string;
  templateId: string;
  connectionId: string;
}

export default async ({
  contact,
  videoId,
  templateId,
  connectionId,
}: IRender) => {
  await axios({
    method: "post",
    url: API_ENDPOINT,
    data: {
      data: {},
      token: process.env.MOTIONBOX_API_KEY,
      videoId,
      templateId,
      connectionId,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
};
