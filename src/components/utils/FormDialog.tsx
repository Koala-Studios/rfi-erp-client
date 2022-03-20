import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface Props {
  title: string;
  description?: string;
  onSubmit?: () => void;
  onClose?: () => void;
  open: boolean;
  setOpen: any;
  submitText: string;
}

const FormDialog: React.FC<Props> = (props) => {
  const handleClickOpen = () => {
    props.setOpen(true);
  };

  const handleClose = () => {
    if (props.onClose) props.onClose();

    props.setOpen(false);
  };
  const handleSubmit = () => {
    if (props.onSubmit) props.onSubmit();
    props.setOpen(false);
  };

  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        {props.description && (
          <DialogContentText>{props.description}</DialogContentText>
        )}
        {props.children}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{props.submitText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
