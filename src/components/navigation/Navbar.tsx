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
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

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
    text: "Products",
    link: "/products",
    icon: <InventoryIcon></InventoryIcon>,
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
    text: "Inventory",
    link: "/inventory",
    icon: <StorageIcon></StorageIcon>,
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
];

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginTop: 64,
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
  boxShadow: "0 0 11px 0 #0000004f",
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

interface Props {
  title: string;
}

export const Navbar: React.FC<Props> = ({ title, children }) => {
  let location = useLocation();

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
      <AppBar position="fixed" open={open} elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ marginLeft: 2 }}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <img src={RFI_Logo} alt="RFI Logo" width={200} height={60} />
          <IconButton onClick={handleDrawerClose} color="secondary">
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
          <Divider
            sx={{
              borderColor: "#ffffff36",
            }}
          />
          {LinkItems.map((item, index) => (
            <Link to={item.link}>
              <ListItem
                button
                key={index}
                sx={{
                  background:
                    location.pathname === item.link ? "#0c3467" : "#020818",
                  transition: "400ms",
                  "&:hover": {
                    background: "#061e3d",
                  },
                }}
              >
                {item.icon}
                <ListItemText
                  primary={item.text}
                  sx={{
                    fontWeight: "medium",
                    marginLeft: 2,
                  }}
                />
              </ListItem>
              <Divider
                sx={{
                  borderColor: "#ffffff36",
                }}
              />
            </Link>
          ))}
        </List>
      </Drawer>

      <Main open={open}>{children}</Main>
    </Box>
  );
};
