const send = {
  //initial handshake
  connection: "connect",
  disconnection: "disconnect",
  initial_data: "id",

  //notification
  notification: "n",
  delete_notification: "dn",
  delete_all_notifications: "dn_all",

  //user
  user_connected: "uc",
  user_disconnected: "ud",
};

export default send;
