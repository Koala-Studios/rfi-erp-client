import io, { Socket } from "socket.io-client";
import send from "./config.socket";
import { INotification } from "./user.logic";
import config from "../config/config";

const base_url = config.API.BASE_URL + ":5001";

//initialize socket
let socket: Socket;

export const initClientSocket = (
  token: string,
  userId: string,
  setConnected: any
) => {
  console.log("connecting, userId:", userId);

  socket = io(base_url, {
    autoConnect: false,
    auth: { token: token },
    query: { userId: userId },
  });
  socket.connect();

  // socket.on(send.notification, (notification: INotification) => {
  //   console.log(notification);
  //   // callback(notification);
  // });

  socket.on(send.connection, () => {
    console.log("connected");
    setConnected(true);
  });
  socket.on(send.disconnection, () => {
    console.log("disconnected");
    setConnected(false);
  });
};

export const socketDisconnect = () => {
  socket.disconnect();
};

export const listenToNotifications = (callback: (n: INotification) => void) => {
  console.log(socket);

  socket.on(send.notification, (notification: INotification) => {
    console.log(notification);
    callback(notification);
  });
};

export const deleteUserNotification = (notificationId: string) => {
  socket.emit(send.delete_notification, notificationId);
};

export const deleteAllUserNotifications = () => {
  socket.emit(send.delete_all_notifications);
};
