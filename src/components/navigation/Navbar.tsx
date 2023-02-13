import * as React from "react";
import {
  createTheme,
  styled,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import RFI_Logo from "../../resources/rfi_logo.svg";
import HvacIcon from "@mui/icons-material/Hvac";
import StorageIcon from "@mui/icons-material/Storage";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import InventoryIcon from "@mui/icons-material/Inventory";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
import { Link, useLocation } from "react-router-dom";
import Badge, { BadgeProps } from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import { AuthContext } from "./AuthProvider";
import { useEffect } from "react";
import NotificationHandler from "./NotificationHandler";
import Button from "@mui/material/Button";
import FormHandler from "./FormHandler";
import OilBarrelIcon from "@mui/icons-material/OilBarrel";
import AccountMenu from "../menus/AccountMenu";

const drawerWidth = 190;

const LinkItems = [
  {
    text: "Projects",
    link: "/projects",
    icon: <AccountTreeIcon></AccountTreeIcon>,
  },
  {
    text: "Batching",
    link: "/batching",
    icon: <HvacIcon></HvacIcon>,
  },
  {
    text: "Inventory",
    link: "/inventory",
    icon: <StorageIcon></StorageIcon>,
  },
  {
    text: "Inv Containers",
    link: "/inventory-stock",
    icon: <OilBarrelIcon></OilBarrelIcon>,
  },
  {
    text: "Products",
    link: "/products",
    icon: <InventoryIcon></InventoryIcon>,
  },
  {
    text: "Development",
    link: "/development",
    icon: <GroupIcon></GroupIcon>,
  },
  {
    text: "Forecast",
    link: "/forecast",
    icon: <BiotechIcon></BiotechIcon>,
  },
  {
    text: "Purchase Orders",
    link: "/purchase-orders",
    icon: <ShoppingBasketIcon></ShoppingBasketIcon>,
  },
  {
    text: "Sales Orders",
    link: "/sales-orders",
    icon: <ShoppingBasketIcon></ShoppingBasketIcon>,
  },
  {
    text: "Stock Count",
    link: "/stock-count",
    icon: <ContentPasteIcon></ContentPasteIcon>,
  },
  {
    text: "Users",
    link: "/users",
    icon: <GroupIcon></GroupIcon>,
  },
  {
    text: "Customers",
    link: "/customers",
    icon: <GroupIcon></GroupIcon>,
  },
  {
    text: "Suppliers",
    link: "/suppliers",
    icon: <PersonPinCircleIcon></PersonPinCircleIcon>,
  },
];

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  height: "calc(100vh - 55px)",
  flexGrow: 1,
  padding: theme.spacing(2),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginTop: 55,
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  boxShadow: "none",
  backgroundColor: "white",
  color: "black",
  borderBottom: "1px solid #c9c9c9",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
  backgroundColor: "#061e3d",
  color: "white",
}));

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 4,
    top: 5,
    padding: "10px 6px",
    borderRadius: 20,
  },
}));

interface Props {
  title: string;
}

export const Navbar: React.FC<Props> = ({ title, children }) => {
  const location = useLocation();
  const auth = React.useContext(AuthContext);

  const [accountAnchorEl, setAccountAnchorEl] = React.useState(null);

  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar style={{ minHeight: 55 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              border: "1px solid #00000036",
              mr: 1,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton size="large" color="primary" sx={{ mr: 1 }}>
            <StyledBadge badgeContent={6} color="info">
              <NotificationsIcon
                color="primary"
                sx={{ height: 30, width: 30 }}
              />
            </StyledBadge>
          </IconButton>
          <div
            style={{ padding: 5 }}
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            // onClick={handleMenu}
            color="inherit"
          >
            <div
              onClick={(event: any) => {
                setAccountAnchorEl(event.currentTarget);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Avatar
                variant="rounded"
                sx={{ bgcolor: "#061e3d", height: 37, width: 37 }}
              >
                TE
              </Avatar>

              <div style={{ textAlign: "start" }}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  component="div"
                  sx={{ marginLeft: 1, mb: 0, lineHeight: 1 }}
                >
                  test
                </Typography>
                <Typography
                  variant="subtitle2"
                  noWrap
                  component="div"
                  sx={{ marginLeft: 1, lineHeight: 1 }}
                >
                  test@gmail.com
                </Typography>
              </div>
            </div>
            <AccountMenu
              anchorEl={accountAnchorEl}
              setAnchorEl={setAccountAnchorEl}
            />
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: "none",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader style={{ minHeight: 55 }}>
          <img src={RFI_Logo} alt="RFI Logo" width={167} height={50} />
          <IconButton
            size="small"
            onClick={handleDrawerClose}
            color="secondary"
          >
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>

        <List
          sx={{
            backgroundColor: "#020818",
            color: "white",
            height: "100%",
            paddingTop: 0,
          }}
        >
          {/* <Divider
            sx={{
              borderColor: "#ffffff36",
            }}
          /> */}
          {LinkItems.map((item, index) => (
            <Link to={item.link} key={index}>
              <ListItem
                button
                sx={{
                  background:
                    location.pathname === item.link ? "#0c3467" : "#020818",
                  border: "1px solid #020818",
                  transition: "400ms",
                  "&:hover": {
                    background: "#061e3d",
                    border: "1px solid #0c3467",
                  },
                  width: "unset",
                  margin: 0.5,
                  mb: 0,
                  mt: 1,
                  borderRadius: 1,
                  pt: 0.5,
                  pb: 0.5,
                }}
              >
                {item.icon}
                <ListItemText
                  primaryTypographyProps={{
                    color: location.pathname === item.link ? "#fff" : "#b2bac2",
                    fontWeight: "500",
                    fontSize: "0.85rem",
                  }}
                  primary={item.text}
                  sx={{
                    marginLeft: 1,
                  }}
                />
              </ListItem>
              {/* <Divider
                sx={{
                  borderColor: "#ffffff36",
                }}
              /> */}
            </Link>
          ))}
        </List>
      </Drawer>

      <Main open={open}>{children}</Main>
      <NotificationHandler></NotificationHandler>
      <FormHandler></FormHandler>
    </Box>
  );
};
