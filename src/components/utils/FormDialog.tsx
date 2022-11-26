import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface Props {
  title: string;
  description?: string;
  onSubmit: Function;
  onClose?: Function;
  open: boolean;
  setOpen: any;
  submitText: string;
}

const FormDialog: React.FC<Props> = (props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleClickOpen = () => {
    props.setOpen(true);
  };

  const handleClose = () => {
    if (props.onClose) props.onClose();

    props.setOpen(false);
  };
  const handleSubmit = () => {
    if (props.onSubmit) props.onSubmit();
  };

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      maxWidth={"sm"}
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>{props.title}</DialogTitle>

      <DialogContent sx={{ pt: "10px!important" }}>
        {props.description && (
          <DialogContentText>{props.description}</DialogContentText>
        )}
        {props.children}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button color="error" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {props.submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
