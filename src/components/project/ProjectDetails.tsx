import { Card, Grid, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ProjectDetailsTable } from "./ProjectDetailsTable";

export const ProjectDetails = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Card variant="outlined" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Project Title"}
              ></TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Project Code"}
              ></TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Customer"}
              ></TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Start Date"}
                type={"date"}
              ></TextField>
            </Grid>
            <Grid item xs={6}>
              {/* <DatePicker
                label="Basic example"
                value={undefined}
                // onChange={(newValue) => {
                //   setValue(newValue);
                // }}
                renderInput={(params) => <TextField {...params} />}
              /> */}
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"End Date"}
                type={"date"}
              ></TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Notes"}
                multiline
                rows={6}
              ></TextField>
            </Grid>
          </Grid>

          <Card
            variant="outlined"
            style={{ width: "50%", minWidth: "50%", padding: 16 }}
          >
            <div>
              <Typography variant="h6">Overview Stats</Typography>
            </div>
          </Card>
        </div>
      </Card>
      <Card variant="outlined" style={{ marginTop: 16, padding: 16 }}>
        <ProjectDetailsTable />
      </Card>
    </div>
  );
};
