import cliProgress from "cli-progress";
import { EventEmitter } from "events";
import WebSocket from "websocket";
const SOCKET_URI =
  "wss://c6ifiee5t6.execute-api.us-west-2.amazonaws.com/development";

type Socket = WebSocket.client;

const multibar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
  },
  cliProgress.Presets.shades_grey
);

const wssConnect = (
  data: any[],
  socket: Socket,
  eventEmitter: EventEmitter
) => {
  try {
    const renderedVideos: string[] = [];
    const videoProgressMap = data.reduce(
      (acc: any, curr: any) => ({
        ...acc,
        [curr.videoId]: {
          bar: multibar.create(100, 0),
          videoId: curr.videoId,
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

          if (payload.Data?.finalVideo) {
            renderedVideos.push(payload.Data.finalVideo);

            console.log({
              rvl: renderedVideos.length,
              dl: data.length,
            });

            if (renderedVideos.length === data.length) {
              eventEmitter.emit("videos_ready", {
                renderedVideos,
              });
            }
          }

          if (
            payload.Data &&
            payload.Data.videoId &&
            !payload.Data.finalVideo
          ) {
            videoProgressMap[payload.Data.videoId].bar.update(
              (payload.Data.progress / payload.Data.totalFrames) * 100
            );
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