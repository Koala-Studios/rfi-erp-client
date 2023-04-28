import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { createProject, listProjects } from "../../logic/project.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { formTypes } from "../../logic/form.logic";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";

const ProjectStatus = [
  ["Draft", "error"],
  ["In Progress", "warning"],
  ["Awaiting Feedback", "info"],
  ["Finished", "success"],
  ["Draft", "error"],
];

const ProjectListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    {
      label: "Product Code",
      field: "product_code",
      type: "text",
    },
    { label: "Batch Code", field: "batch_code", type: "text" },
    { label: "Quantity", field: "quantity", type: "number", regexOption: null },
  
  ];
  const columns: GridColDef[] = [
    { field: "project_code", headerName: "Code", width: 100 },
    { field: "name", headerName: "Name", width: 300 },

    {
      field: "status",
      headerName: "Status",
      width: 130,
      align: "center",
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={ProjectStatus[params.value ? params.value - 1 : 4][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={ProjectStatus[params.value ? params.value - 1 : 4][1]}
          variant="outlined"
        />
      ),
    },
    { field: "assigned_user", headerName: "Assigned Rep", width: 100 },
    {
      field: "request_size",
      headerName: "Req Size",
      width: 80,
      align: "center",
    },
    { field: "start_date", headerName: "Start Date", width: 120 },
    { field: "due_date", headerName: "Due Date", width: 120 },
    { field: "finish_date", headerName: "Finish Date", width: 120 },
    { field: "notes", headerName: "Notes", width: 350 },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 150,
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
            Open Project
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    listProjects(searchParams, filterArray).then((list) => {
      console.log(list);
      const newRows = list!.docs.map((project) => {
        return {
          id: project._id,
          name: project.name,
          project_code: project.project_code,
          status: project.status,
          assigned_user: project.assigned_user ?? "None",
          notes: project.notes,
          request_size: project.project_items.length,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);

  if (dataOptions == null) return null;

  //TODO:Memoization
  const createProjectForm = () => {
    window.dispatchEvent(
      new CustomEvent("OpenFormEvent", {
        detail: {
          formType: formTypes.CreateProject,
          onSubmit: (formData: any) => {
            createProject(formData);
            console.log("hello", formData);
          },
        },
      })
    );
  };

  const createNewProject = () => {
    navigate(`/projects/new`, { replace: false });
  };

  const handleRowDBClick: GridEventListener<"rowClick"> = (
    params, // GridRowParams
    event, // MuiEvent<React.MouseEvent<HTMLElement>>
    details // GridCallbackDetails
  ) => {
    navigate(`/projects/${params.row.id}`, { replace: false });
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>
        <Button variant="contained" color="primary" onClick={createNewProject}>
          + New Project
        </Button>
      </Card>
      <DataTable
        handleDBClick={handleRowDBClick}
        rows={dataOptions.rows}
        columns={columns}
        listOptions={dataOptions.listOptions}
      ></DataTable>
    </>
  );
};

export default ProjectListPage;
