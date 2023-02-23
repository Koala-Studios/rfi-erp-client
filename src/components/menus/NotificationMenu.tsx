import { Logout, Settings } from "@mui/icons-material";
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { INotification, IUser } from "../../logic/user.logic";
import { AuthContext } from "../navigation/AuthProvider";
import CloseIcon from "@mui/icons-material/Close";
import { deleteUserNotification } from "../../logic/user.socket";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import InfoIcon from "@mui/icons-material/Info";

interface Props {
  anchorEl: null | HTMLElement;
  setAnchorEl: any;
}

const NotificationMenu: React.FC<Props> = ({ anchorEl, setAnchorEl }) => {
  //   const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const auth = React.useContext(AuthContext);
  // const [notifications, setNotifications] = useState<INotification[]>([]);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  // useEffect(() => {
  //   if (auth.user) {
  //     setNotifications(auth.user.notifications);
  //   }
  // }, [auth.user]);

  const handleCloseNotification = (n: INotification) => {
    if (n._id) {
      deleteUserNotification(n._id);
    }

    // const newNotifications = auth.user.filter((n:INotification)=>{if(n._id ==)})

    // auth.setUser((u:IUser) =>{...u,})
  };

  const handleClearAll = () => {};

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      id="notification-menu"
      open={open}
      onClose={handleClose}
      PaperProps={{
        elevation: 0,
        sx: {
          width: 400,
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          "& .MuiAvatar-root": {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateX(195px) translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Typography sx={{ pl: 2, textAlign: "center" }} variant="h6">
        Notifications
      </Typography>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <div style={{ maxHeight: 600, overflowY: "scroll" }}>
        {auth.user?.notifications?.map((n: INotification) => (
          <>
            <MenuItem dense sx={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <InfoIcon />
                <div>
                  <Typography variant="subtitle2" color="#008060">
                    {n.sender}
                  </Typography>
                  <Typography variant="subtitle2">{n.text}</Typography>
                </div>
              </div>
              <IconButton onClick={() => deleteUserNotification(n._id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </MenuItem>
            <Divider />
          </>
        ))}
      </div>

      <MenuItem
        sx={{ justifyContent: "center" }}
        onClick={handleClearAll}
        dense
      >
        <ListItemIcon>
          <ClearAllIcon fontSize="small" />
        </ListItemIcon>
        Clear All
      </MenuItem>
    </Menu>
  );
};

export default NotificationMenu;
