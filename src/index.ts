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
    const data = contacts.map((contact: any) => ({
      videoId: uuid(),
      ...contact,
    }));

    // Establishes connection to render socket gateway
    wssConnect(data, eventEmitter);

    eventEmitter.on("connection_established", async (payload) => {
      try {
        const connectionId = payload.connectionId;

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

    eventEmitter.on("update_person", async (payload) => {
      const id = payload.id;
      const bar = payload.bar;
      const finalVideo = payload.finalVideo;

      try {
        await updatePerson({
          id,
          finalVideo,
        });

        bar.update(100, {
          status: "🟢",
        });
      } catch (e) {
        console.log({
          e,
        });
      }
    });

    console.log(`🚀 Motionbox Apollo is alive and listening on port: ${port}`);
  } catch (e) {
    console.log({
      e,
    });
  }
});
