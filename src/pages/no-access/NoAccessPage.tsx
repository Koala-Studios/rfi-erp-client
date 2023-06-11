import { Button, Card, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const NoAccessPage = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h3">You Do Not Have Access</Typography>
        <Typography variant="body1" sx={{ pt: 2, pb: 2 }}>
          You do not have access to view the information on this page.
        </Typography>
        <Link to="/">
          <Button
            fullWidth
            disableElevation
            size="large"
            type="submit"
            variant="contained"
            color="primary"
            endIcon={<NavigateNextIcon />}
          >
            Go Back
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NoAccessPage;
