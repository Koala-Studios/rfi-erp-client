import { Card, Grid, TextField, Typography } from "@mui/material";
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
import { ValidationInfo, isValid } from "../../logic/utils";

// const yyyymmdd = (date: Date) => {
//   var mm = date.getMonth() + 1; // getMonth() is zero-based
//   var dd = date.getDate();

//   return [
//     date.getFullYear(),
//     (mm > 9 ? "" : "0") + mm,
//     (dd > 9 ? "" : "0") + dd,
//   ].join("-");
// };

const emptyProject: IProject = {
  _id: "",
  name: "",
  project_code: "",
  project_items: [],
  start_date: "",
  customer: null,
  iteration: 0,
};

let savedProject: IProject | null = null;

interface InputInfo {
  label: string;
  ref: number;
  validation: ValidationInfo;
}

const inputRefMap = {
  name: 0,
  product_code: 1,
};

const inputMap: InputInfo[] = [
  { label: "name", ref: 0, validation: { required: true, genericVal: "Text" } },
  {
    label: "project_code",
    ref: 1,
    validation: { required: true, genericVal: "Text" },
  },
];

interface InputInfoItem {
  error?: boolean;
  helperText?: string;
}

export const ProjectDetails = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [project, setProject] = useState<IProject | null>(null);

  const [projectSaved, setProjectSaved] = useState<boolean>(true);

  const inputRefs = useRef<any[]>([]);
  const [inputStates, setInputStates] = useState<InputInfoItem[]>(
    Array(inputMap.length).fill({ error: false })
  );

  // usePrompt(
  //   "You have unsaved changes. Are you sure you want to leave?",
  //   !projectSaved
  // );

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
    //check valid
    //save to project
    const _input = inputRefs.current[input.ref];

    const inputValidation = isValid(
      _input.value,
      inputMap[input.ref].validation
    );

    console.log(_input.value, inputValidation);
    if (inputValidation.valid === false) {
      inputStates[input.ref].helperText = inputValidation.msg;
      inputStates[input.ref].error = true;
    } else {
      inputStates[input.ref].helperText = "";
      inputStates[input.ref].error = false;
    }

    setInputStates({ ...inputStates });
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

      const inputValidation = isValid(_input.value, inputMap[i].validation);

      // console.log(_input.value, inputValidation);
      if (inputValidation.valid === false) {
        inputStates[i].helperText = inputValidation.msg;
        inputStates[i].error = true;

        setInputStates({ ...inputStates });

        allValid = false;
      } else {
      }
    }

    if (allValid === false) {
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
            <Grid item xs={12}>
              <TextField
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.name] = el)
                }
                error={inputStates[inputRefMap.name].error}
                helperText={inputStates[inputRefMap.name].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.name])
                }
                required={inputMap[inputRefMap.name].validation.required}
                // onChange={(e) =>
                //   setProject({ ...project, name: e.target.value })
                // }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Project Title"}
                // value={project.name}
                defaultValue={project.name}
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
                onChange={(e) =>
                  setProject({ ...project, start_date: e.target.value })
                }
                helperText="Incorrect entry."
                error
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Start Date"}
                type={"date"}
                value={project.start_date}
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
            setProjectSaved(false);
          }}
        />
      </Card>
    </>
  );
};
