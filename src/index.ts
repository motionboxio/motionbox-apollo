import express from "express";
import { v1 as uuid } from "uuid";
import EventEmitter from "events";
import wssConnect from "./wssConnect";
import getPeople from "./apollo/get_people";
import updatePerson from "./apollo/update_person";
import render from "./render";
require("dotenv").config();

const app = express();
const port = 9000;
const eventEmitter = new EventEmitter();

app.listen(port, async () => {
  try {
    // Gets people from Apollo
    const contacts = await getPeople();
    const data = contacts.slice(0, 6).map((contact: any) => ({
      videoId: uuid(),
      ...contact,
    }));

    // Establishes connection to render socket gateway
    wssConnect(data, eventEmitter);

    eventEmitter.on("connection_established", async (payload) => {
      const connectionId = payload.connectionId;

      try {
        // Render a video for each person
        await Promise.all(
          data.map(
            async ({ videoId, ...contact }: any) =>
              await render({
                contact,
                videoId,
                templateId: "ckxf20b781070klt9tx12okum",
                connectionId,
              })
          )
        );
      } catch (e) {
        console.log({
          e,
        });
      }
    });

    eventEmitter.on("videos_ready", async (payload) => {
      const renderedVideos = payload.renderedVideos;

      await Promise.all(
        data.map(async (contact: any) => {
          try {
            const { finalVideo } = renderedVideos.find(
              ({ videoId }: any) => videoId === contact.videoId
            );

            console.log({
              id: contact.id,
              finalVideo,
            });

            return await updatePerson({
              id: contact.id,
              finalVideo,
            });
          } catch (e) {
            console.log({
              e,
            });
          }
        })
      );

      console.log("Done ✅");
    });

    console.info(`🚀 Motionbox Apollo is alive and listening on port: ${port}`);
  } catch (e) {
    console.log({
      e,
    });
  }
});
