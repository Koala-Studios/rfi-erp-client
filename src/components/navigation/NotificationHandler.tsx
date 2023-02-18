import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import { SnackbarProvider, VariantType, useSnackbar } from "notistack";
import { listenToNotifications } from "../../logic/user.socket";
import { INotification } from "../../logic/user.logic";
import { AuthContext } from "./AuthProvider";
// import gfae from "../../resources/rfi_logo.svg";

// const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
//   props,
//   ref
// ) {
//   return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
// });

interface INotificationEvent {
  detail: any;
  color?: AlertColor;
}

const notification_sound = require("../../resources/notification_sound.mp3");
const playNotificationSound = () => {
  new Audio(notification_sound).play();
};

const NotificationHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const auth = React.useContext(AuthContext);

  useEffect(() => {
    // Update the document title using the browser API

    const handler = (e: any) => {
      enqueueSnackbar(e.detail.text, {
        variant: e.detail.color ? e.detail.color : "success",
      });
      playNotificationSound();
    };

    window.addEventListener("NotificationEvent", handler);

    // listenToNotifications((n: INotification) => {
    //   enqueueSnackbar(n.text, {
    //     variant: "info",
    //   });
    //   playNotificationSound();
    // });
    return () => {
      window.removeEventListener("NotificationEvent", handler);
    };
  }, []);

  useEffect(() => {
    console.log("notifications");
    if (auth.connected) {
      listenToNotifications((n: INotification) => {
        enqueueSnackbar(n.text, {
          variant: "info",
        });
        playNotificationSound();
      });
    }
  }, [auth.connected]);

  return <></>;
};

export default NotificationHandler;
