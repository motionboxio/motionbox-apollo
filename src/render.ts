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
      data: {
        ["9a782ce0-62c1-11ec-8e40-6b4c65a2ade5"]: {
          link: contact.photo_url
            ? contact.photo_url
            : "https://motionbox.io/unsplash/photo-1628157588553-5eeea00af15c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxNTk0MXwwfDF8c2VhcmNofDExfHxhdmF0YXJ8ZW58MHx8fHwxNjQwMTM0NDE1&ixlib=rb-1.2.1&q=80&w=1080",
          opacity: contact.photo_url ? 1 : 0,
        },
        ["dea29240-61d4-11ec-be77-954d1c50993a"]: {
          animationData: {
            animationText: {
              ["Text 02"]: String(contact.first_name).toUpperCase(),
            },
          },
        },
      },
      token: process.env.MOTIONBOX_API_KEY,
      videoId,
      templateId,
      connectionId,
      targetFormat: "gif",
      targetQuality: 60,
      targetResolution: "480",
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
};
