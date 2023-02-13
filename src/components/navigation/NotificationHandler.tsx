import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface INotificationEvent {
  detail: any;
  color?: AlertColor;
}

const NotificationHandler = () => {
  useEffect(() => {
    // Update the document title using the browser API
    window.addEventListener("NotificationEvent", (e: any) => {
      setNotificationText(e.detail.text);
      setNotificationColor(e.detail.color ? e.detail.color : "success")
      setNotification(true);
    });
  }, []);

  const [notificationText, setNotificationText] = React.useState<string>("");
  const [notificationColor, setNotificationColor] = React.useState<AlertColor | undefined>("warning");
  const [showNotification, setNotification] = React.useState(false);

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={showNotification}
      autoHideDuration={6000}
      onClose={() => setNotification(false)}
    >
      <Alert
        onClose={() => setNotification(false)}
        severity={notificationColor}
        sx={{ width: "100%" }}
      >
        {notificationText}
      </Alert>
    </Snackbar>
  );
};

export default NotificationHandler;
