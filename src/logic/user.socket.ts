import io from "socket.io-client";
import send from "./config.socket";
import { INotification } from "./user.logic";

const base_url = "http://localhost:3001";

//initialize socket
const socket = io(base_url, { autoConnect: false });

export const initClientSocket = (userId: string) => {
  //TODO:Authenticate connection with jwt
  socket.connect();

  socket.emit(send.initial_data, userId);
};

export const socketDisconnect = () => {
  socket.disconnect();
};

export const listenToNotifications = (callback: (n: INotification) => void) => {
  socket.on(send.notification, (notification: INotification) => {
    callback(notification);
  });
};

export const deleteUserNotification = (notificationId: string) => {
  socket.emit(send.delete_notification, notificationId);
};
