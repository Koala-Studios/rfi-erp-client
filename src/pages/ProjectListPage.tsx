import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { createProject, listProjects } from "../logic/project.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formTypes } from "../logic/form.logic";

const ProjectStatus = [
  ["Pending", "error"],
  ["In Progress", "warning"],
  ["Awaiting Approval", "info"],
  ["Approved", "success"],
  ["Error", "error"],
];

const ProjectListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    // { field: "product_code", headerName: "Code", width: 200 },
    { field: "name", headerName: "Name", width: 300 },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   width: 200,
    //   renderCell: (params: GridRenderCellParams<number>) => (
    //     <Chip
    //       label={ProjectStatus[params.value ? params.value - 1 : 4][0]}
    //       sx={{
    //         fontWeight: 600,
    //       }}
    //       //@ts-ignore
    //       color={ProductStatus[params.value ? params.value - 1 : 4][1]}
    //       variant="outlined"
    //     />
    //   ),
    // },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 250,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              navigate(`/projects/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listProjects(auth.token, 25, 1).then((projectList) => {
      console.log(projectList);
      const newRows = projectList.map((project) => {
        return {
          id: project._id,
          project_code: project.project_code,
          name: project.name,
          // status: project.status,
          // assigned_user: project.assigned_user,
          // notes: project.notes,
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  //TODO:Memoization
  const createProjectForm = () => {
    window.dispatchEvent(
      new CustomEvent("OpenFormEvent", {
        detail: {
          formType: formTypes.CreateProject,
          onSubmit: (formData: any) => {
            createProject(auth.token, formData);
            console.log("hello", formData);
          },
        },
      })
    );
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <Button variant="contained" color="primary" onClick={createProjectForm}>
          + New Project
        </Button>
      </Card>
      <DataTable rows={rows!} columns={columns}></DataTable>;
    </>
  );
};

export default ProjectListPage;
