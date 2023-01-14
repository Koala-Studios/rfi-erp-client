import { Button, Paper, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import React from "react";

interface Props {
  display: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const SaveForm: React.FC<Props> = ({ display, onSave, onCancel }) => {
  return (
    <Paper
      sx={{
        opacity: display ? 1 : 0,
        transition: "300ms",
        display: "flex",
        position: "fixed",
        justifyContent: "space-between",
        padding: "10px 30px",
        mt: -9,
        width: "-webkit-fill-available",
        marginLeft: -2,
        backgroundColor: "#202123",
        borderRadius: 0,
        alignItems: "center",
        pointerEvents: display ? "all" : "none",
        zIndex: 100000,
      }}
    >
      <Typography color="white" variant="h6">
        Unsaved Changes
      </Typography>

      <div>
        <Button
          color="secondary"
          variant="outlined"
          onClick={onCancel}
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          sx={{
            ml: 2,
            textAlign: "center",
          }}
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </Paper>
  );
};

export default SaveForm;
