import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

interface DialogBoxProps {
  showDialog: boolean;
  cancelNavigation: any;
  confirmNavigation: any;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const DialogBox: React.FC<DialogBoxProps> = ({
  showDialog,
  cancelNavigation,
  confirmNavigation,
}) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    cancelNavigation();
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          There are unsaved changes!
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Do you want to leave the page?
        </Typography>
      </Box>
    </Modal>
  );
};
export default DialogBox;
