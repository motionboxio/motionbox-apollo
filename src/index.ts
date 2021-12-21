import express from "express";
import { v1 as uuid } from "uuid";
import WebSocket from "websocket";
import EventEmitter from "events";
import wssConnect from "./wssConnect";
import getPeople from "./apollo/get_people";
import render from "./render";
require("dotenv").config();

const eventEmitter = new EventEmitter();
const WebSocketClient = WebSocket.client;
const SOCKET_URI =
  "wss://c6ifiee5t6.execute-api.us-west-2.amazonaws.com/development";

const app = express();
const port = 9000;
const socket = new WebSocketClient();
socket.connect(SOCKET_URI);

app.listen(port, async () => {
  try {
    // Gets people from Apollo
    const contacts = await getPeople();
    const data = contacts.slice(0, 1).map((contact: any) => ({
      videoId: uuid(),
      ...contact,
    }));

    // Establishes connection to render socket gateway
    wssConnect(data, socket, eventEmitter);

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

        console.info(`${data.length} render requests were sent!`);
      } catch (e) {
        console.log({
          e,
        });
      }
    });

    eventEmitter.on("videos_ready", async (payload) => {
      const renderedVideos = payload.renderedVideos;

      console.log(
        "Make PUT request with new video urls here, we need customer ids",
        {
          renderedVideos,
        }
      );
    });

    console.info(`🚀 Motionbox Apollo is alive and listening on port: ${port}`);
  } catch (e) {
    console.log({
      e,
    });
  }
});
