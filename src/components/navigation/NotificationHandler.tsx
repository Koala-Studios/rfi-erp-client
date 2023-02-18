import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import { SnackbarProvider, VariantType, useSnackbar } from "notistack";
import { listenToNotifications } from "../../logic/user.socket";
import { INotification } from "../../logic/user.logic";
import notification_sound from "../../resources/rfi_logo.svg";

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

const playNotificationSound = () => {
  new Audio(notification_sound).play();
};

const NotificationHandler = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Update the document title using the browser API
    window.addEventListener("NotificationEvent", (e: any) => {
      enqueueSnackbar(e.detail.text, {
        variant: e.detail.color ? e.detail.color : "success",
      });
      playNotificationSound();
    });

    listenToNotifications((n: INotification) => {
      enqueueSnackbar(n.text);
      playNotificationSound();
    });
  }, []);

  return <></>;
};

export default NotificationHandler;
