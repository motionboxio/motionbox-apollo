import { EventEmitter } from "events";
import WebSocket from "websocket";
import cliProgress from "cli-progress";
const WebSocketClient = WebSocket.client;
const SOCKET_URI =
  "wss://c6ifiee5t6.execute-api.us-west-2.amazonaws.com/development";

const wssConnect = (data: any[], eventEmitter: EventEmitter) => {
  try {
    const socket = new WebSocketClient();
    socket.connect(SOCKET_URI);

    const multibar = new cliProgress.MultiBar(
      {
        stopOnComplete: false,
        clearOnComplete: false,
        hideCursor: true,
        format:
          "{bar} | status: {status} | name: {name} | id: {id} | {percentage}% of {total} | finalVideo: {finalVideo}",
      },
      cliProgress.Presets.shades_grey
    );

    const map = data.reduce(
      (acc: any, curr: any) => ({
        ...acc,
        [curr.videoId]: {
          bar: multibar.create(100, 0, {
            id: curr.id,
            name: curr.name,
            status: "🔴",
            finalVideo: "",
          }),
          videoId: curr.videoId,
          personId: curr.id,
        },
      }),
      {}
    );

    socket.on("connectFailed", (error) => {
      console.log("Connect Error: " + error.toString());
    });

    socket.on("connect", (connection) => {
      if (connection.connected) {
        connection.send("connectionId");

        setInterval(() => {
          connection.send(`{ action: ${"heartbeat"} }`);
        }, 10000);
      }

      connection.on("error", (error) => {
        console.log("Connection Error: " + error.toString());
      });

      connection.on("close", () => {
        console.log("echo-protocol Connection Closed");
        socket.connect(SOCKET_URI);
      });

      connection.on("message", (message: any) => {
        try {
          const payload = message.utf8Data ? JSON.parse(message.utf8Data) : {};

          if (payload.connectionId) {
            eventEmitter.emit("connection_established", {
              connectionId: payload.connectionId,
            });
          }

          if (
            payload.Data &&
            payload.Data.videoId &&
            !payload.Data.finalVideo
          ) {
            map[payload.Data.videoId].bar.update(
              Number(
                (
                  (payload.Data.progress / payload.Data.totalFrames) *
                  100
                ).toFixed(2)
              )
            );
          }

          if (payload.Data?.finalVideo) {
            eventEmitter.emit("update_person", {
              id: map[payload.Data.videoId].personId,
              bar: map[payload.Data.videoId].bar,
              finalVideo: payload.Data.finalVideo,
            });
          }
        } catch (e) {
          console.log("Error parsing message", { e });
        }
      });
    });
  } catch (e) {
    console.log({
      e,
    });
  }
};

export default wssConnect;
