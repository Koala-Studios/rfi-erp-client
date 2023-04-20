import { Card, Chip, Grid, TextField, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useState, useContext, useRef, createRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ICustomer } from "../../logic/customer.logic";
import {
  createProject,
  getProject,
  IProject,
  IProjectItem,
  updateProject,
} from "../../logic/project.logic";
import SaveForm from "../forms/SaveForm";
import { AuthContext } from "../navigation/AuthProvider";
import StandaloneAutocomplete from "../utils/StandaloneAutocomplete";
import { ProjectDetailsTable } from "./ProjectDetailsTable";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  InputInfo,
  InputVisual,
  ValidationInfo,
  isValid,
  validateInput,
} from "../../logic/validation.logic";

// const yyyymmdd = (date: Date) => {
//   var mm = date.getMonth() + 1; // getMonth() is zero-based
//   var dd = date.getDate();

//   return [
//     date.getFullYear(),
//     (mm > 9 ? "" : "0") + mm,
//     (dd > 9 ? "" : "0") + dd,
//   ].join("-");
// };

const ProjectStatus = [
  ["Pending", "error"],
  ["In Progress", "warning"],
  ["Awaiting Approval", "info"],
  ["Awaiting QC", "warning"],
  ["Approved", "success"],
  ["Error", "error"],
];

const emptyProject: IProject = {
  _id: "",
  name: "",
  project_code: "",
  project_items: [],
  start_date: new Date().toISOString().split('T')[0],
  customer: null,
  iteration: 0,
  status: 6
};

let savedProject: IProject | null = null;

const inputRefMap = {
  name: 0,
  project_code: 1,
  start_date: 2,
  notes: 3
};

const inputMap: InputInfo[] = [
  { label: "name", ref: 0, validation: { required: true, genericVal: "Text" } },
  {
    label: "project_code",
    ref: 1,
    validation: { required: true, genericVal: "Text" },
  },
  {
    label: "start_date",
    ref: 2,
    validation: { required: true, genericVal: "Text" },
  },
  {
    label: "notes",
    ref: 3,
    validation: { required: false, genericVal: "Text" },
  }
];

export const ProjectDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [project, setProject] = useState<IProject | null>(null);

  const [projectSaved, setProjectSaved] = useState<boolean>(true);

  const inputRefs = useRef<any[]>([]);
  const [inputVisuals, setInputVisuals] = useState<InputVisual[]>(
    Array(inputMap.length).fill({ helperText: "", error: false })
  );

  useEffect(() => {
    if (id === "new") {
      //new project, create new on save
      savedProject = emptyProject;
      setProject(emptyProject);
    } else {
      getProject(id!).then((p) => {
        savedProject = p;
        setProject(p!);
        // setProjectSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (project == null || projectSaved === false) return;

    if (JSON.stringify(savedProject) !== JSON.stringify(project)) {
      setProjectSaved(false);
    }
  }, [project]);

  const onInputBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    input: InputInfo
  ) => {
    const _input = inputRefs.current[input.ref];

    const inputVal = isValid(_input.value, inputMap[input.ref].validation);
    inputVisuals[input.ref] = {
      helperText: inputVal.msg,
      error: !inputVal.valid,
    };

    setInputVisuals({ ...inputVisuals });

    const label = inputMap[input.ref].label;
    //@ts-ignore
    project[label] = event.target.value;

    setProject({ ...project! });
    setProjectSaved(false);
  };

  const saveProject = async () => {
    let allValid = true;
    //do client side validation
    for (let i = 0; i < inputRefs.current.length; i++) {
      const _input = inputRefs.current[i];

      const inputVal = isValid(_input.value, inputMap[i].validation);
      inputVisuals[i] = {
        helperText: inputVal.msg,
        error: !inputVal.valid,
      };

      if (inputVal.valid === false) {
        allValid = false;
      }
    }

    setInputVisuals({ ...inputVisuals });

    if (allValid === false) {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: {
            text: "Changes Not Saved. Some inputs are invalid",
            color: "error",
          },
        })
      );
      return;
    }

    //send new project to server
    if (id === "new") {
      const newProjectId = await createProject(project!);

      if (newProjectId) {
        navigate(`/projects/${newProjectId}`, { replace: true });
        setProject({ ...project!, _id: newProjectId });
      }
    } else {
      const updated = await updateProject(project!);

      if (updated === false) {
        throw Error("Update Project Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setProjectSaved(true);
  };
  const cancelSaveProject = () => {
    // console.log(ref1.current!.value);
    setProject(savedProject);
    setProjectSaved(true);
  };

  if (project == null) return null;

  return (
    <>
      <SaveForm
        display={!projectSaved}
        onSave={saveProject}
        onCancel={cancelSaveProject}
      ></SaveForm>
      {/* <div style={{ height: 50 }}></div> */}
      <Card variant="outlined" style={{ padding: 16 }}>
        <Button
          sx={{ mb: 3 }}
          aria-label="go back"
          size="medium"
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon fontSize="small" />
        </Button>
        <div style={{ display: "flex", gap: 16 }}>
          <Grid container spacing={3}>
            <Grid item xs={10}>
              <TextField
                defaultValue={project.name}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.name] = el)
                }
                error={inputVisuals[inputRefMap.name].error}
                helperText={inputVisuals[inputRefMap.name].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.name])
                }
                required={inputMap[inputRefMap.name].validation.required}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Project Title"}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
                <Chip
                //@ts-ignore
                label={ProjectStatus[project.status][0]}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
                //@ts-ignore
                color={ProjectStatus[project.status][1]}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                defaultValue={project.project_code}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.project_code] = el)
                }
                error={inputVisuals[inputRefMap.project_code].error}
                helperText={inputVisuals[inputRefMap.project_code].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.project_code])
                }
                required={
                  inputMap[inputRefMap.project_code].validation.required
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Project Code"}
              ></TextField>
            </Grid>

            <Grid item xs={6}>
              <StandaloneAutocomplete
                initialValue={project.customer}
                onChange={(e, value) => {
                  setProject({ ...project, customer: value });
                }}
                label={"Customer"}
                letterMin={0}
                dbOption={"customer"}
                // getOptionLabel={(item: ICustomer) => item.code + ' | ' + item.name}
                getOptionLabel={(item: ICustomer) => item.name}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                defaultValue={project.start_date.toString().split('T')[0]}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.start_date] = el)
                }
                error={inputVisuals[inputRefMap.start_date].error}
                helperText={inputVisuals[inputRefMap.start_date].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.start_date])
                }
                required={inputMap[inputRefMap.start_date].validation.required}
                // onChange={(e) =>
                //   setProject({ ...project, start_date: e.target.value })
                // }
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Start Date"}
                type={"date"}
              ></TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"End Date"}
                value={project.finish_date}
                type={"date"}
                onChange={(e) =>
                  setProject({ ...project, finish_date: e.target.value })
                }
              ></TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                defaultValue={project.notes}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.notes] = el)
                }
                error={inputVisuals[inputRefMap.notes].error}
                helperText={inputVisuals[inputRefMap.notes].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.notes])
                }
                required={
                  inputMap[inputRefMap.notes].validation.required
                }
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
        <ProjectDetailsTable
          projectItems={project.project_items}
          setProjectItems={(pItems: IProjectItem[]) => {
            setProject({ ...project, project_items: pItems });
            setProjectSaved(false);
          }}
        />
      </Card>
    </>
  );
};
