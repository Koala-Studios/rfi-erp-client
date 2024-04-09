import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import { Button, Divider } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useEffect, useState } from "react";

import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

const formBlueprints = {
  delete: {
    type: "delete",
    title: "Delete Confirmation",
    description:
      "Are you sure you want to delete this item? This change cannot be reverted.",
    submitText: "Delete",
    color: "error",
  },
  approve: {
    type: "approve",
    title: "Approve Confirmation",
    description:
      "Are you sure you want to delete this item? This change cannot be reverted.",
    submitText: "Approve",
    color: "success",
  },
  generic: {
    type: "generic",
    title: "Edit Confirmation",
    description:
      "Are you sure you want edit this item? This change cannot be reverted.",
    submitText: "Delete",
    color: "primary",
  },
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let submitCallback: any = null;

const ValidateForm = () => {
  const [open, setOpen] = useState(false);
  const [formInfo, setFormInfo] = useState(formBlueprints["generic"]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = () => {
    if (submitCallback) submitCallback();

    handleClose();
  };

  useEffect(() => {
    // Update the document title using the browser API

    window.addEventListener("ValidateForm", (e: any) => {
      const formType: "delete" | "approve" | "generic" = e.detail.formType;
      //   SetSubmitCallback((formData: any) => e.detail.onSubmit(formData));
      submitCallback = e.detail.onSubmit;
      setFormInfo(formBlueprints[formType]);
      setOpen(true);
    });
  }, []);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={"xs"}
        TransitionComponent={Transition}
      >
        <DialogTitle>
          {formInfo.type === "delete" && (
            <DeleteOutlineIcon
              fontSize="medium"
              sx={{ mr: 1, transform: "translateY(5px)" }}
            ></DeleteOutlineIcon>
          )}
          {formInfo.type === "approve" && (
            <CheckCircleOutlineIcon
              fontSize="medium"
              sx={{ mr: 1, transform: "translateY(5px)" }}
            ></CheckCircleOutlineIcon>
          )}
          {formInfo.type === "generic" && (
            <EditIcon
              fontSize="medium"
              sx={{ mr: 1, transform: "translateY(5px)" }}
            ></EditIcon>
          )}
          {formInfo.title}
        </DialogTitle>

        <Divider />
        <DialogContent sx={{ pt: "10px!important" }}>
          <DialogContentText color="black">
            {formInfo.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end" }}>
          <Button color="primary" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            // @ts-ignore
            color={formInfo.color}
            variant="contained"
            onClick={handleSubmit}
          >
            {formInfo.type === "delete" && (
              <DeleteOutlineIcon
                fontSize="small"
                sx={{ mr: 1 }}
              ></DeleteOutlineIcon>
            )}
            {formInfo.type === "approve" && (
              <CheckCircleOutlineIcon
                fontSize="small"
                sx={{ mr: 1 }}
              ></CheckCircleOutlineIcon>
            )}
            {formInfo.type === "generic" && (
              <EditIcon fontSize="small" sx={{ mr: 1 }}></EditIcon>
            )}
            {formInfo.submitText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ValidateForm;
