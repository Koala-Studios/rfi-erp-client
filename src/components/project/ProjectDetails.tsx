import { Card, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProject,
  getProject,
  IProject,
  IProjectItem,
  updateProject,
} from "../../logic/project.logic";
import SaveForm from "../forms/SaveForm";
import { AuthContext } from "../navigation/AuthProvider";
import { ProjectDetailsTable } from "./ProjectDetailsTable";

const yyyymmdd = (date: Date) => {
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var dd = date.getDate();

  return [
    date.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("-");
};

let savedProject: IProject | null = null;

export const ProjectDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [project, setProject] = useState<IProject>({
    _id: "",
    name: "",
    project_code: "",
    project_items: [],
    start_date: new Date(),
  });

  const [projectSaved, setProjectSaved] = useState<boolean>(true);

  // usePrompt(
  //   "You have unsaved changes. Are you sure you want to leave?",
  //   !projectSaved
  // );

  useEffect(() => {
    if (id === "new") {
      //new project, create new on save
      savedProject = project;
    } else {
      getProject(auth.token, id!).then((p) => {
        setProject(p!);
        savedProject = p;
        // setProjectSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (projectSaved === false || savedProject == null) return;

    console.log(
      "projectSaved",
      JSON.stringify(savedProject) !== JSON.stringify(project)
    );

    if (JSON.stringify(savedProject) !== JSON.stringify(project)) {
      setProjectSaved(false);
    }
  }, [project]);

  const saveProject = async () => {
    //send new project to server
    if (id === "new") {
      const newProjectId = await createProject(auth.token, project);

      if (newProjectId) {
        navigate(`/projects/${newProjectId}`, { replace: true });
        setProject({ ...project, _id: newProjectId });
      }
    } else {
      const updated = await updateProject(auth.token, project);

      if (updated === false) {
        throw Error("Update Project Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", { detail: "Changes Saved" })
    );
    setProjectSaved(true);
  };
  const cancelSaveProject = () => {
    setProject(savedProject!);
    setProjectSaved(true);
  };

  return (
    <>
      <SaveForm
        display={!projectSaved}
        onSave={saveProject}
        onCancel={cancelSaveProject}
      ></SaveForm>
      {/* <div style={{ height: 50 }}></div> */}
      <Card variant="outlined" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                onChange={(e) =>
                  setProject({ ...project, name: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Project Title"}
                value={project.name}
              ></TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                onChange={(e) =>
                  setProject({ ...project, project_code: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Project Code"}
                value={project.project_code}
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
                // onChange={(e) =>
                //   setProject({ ...project, start_date: e.target.value })
                // }
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Start Date"}
                type={"date"}
                // value={yyyymmdd(project.start_date)}
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
                // value={project.finish_date}
              ></TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                onChange={(e) =>
                  setProject({ ...project, notes: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Notes"}
                multiline
                rows={6}
                value={project.notes}
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
        <ProjectDetailsTable
          projectItems={project.project_items}
          setProjectItems={(pItems: IProjectItem[]) => {
            setProject({ ...project, project_items: pItems });
          }}
        />
      </Card>
    </>
  );
};
