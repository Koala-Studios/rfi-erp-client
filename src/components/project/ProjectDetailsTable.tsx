import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetterParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import { IProjectItem } from "../../logic/project.logic";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const ProjectStatus = [
  ["Pending", "error"],
  ["In Progress", "warning"],
  ["Awaiting Approval", "info"],
  ["Approved", "success"],
  ["Error", "error"],
];

function SelectEditInputCell(props: GridRenderCellParams) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  const handleChange = async (event: SelectChangeEvent) => {
    await apiRef.current.setEditCellValue({
      id,
      field,
      value: event.target.value,
    });
    apiRef.current.stopCellEditMode({ id, field });
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      size="small"
      sx={{ height: 1 }}
      native
      autoFocus
    >
      <option value={1}>Pending</option>
      <option value={2}>In Progress</option>
      <option value={3}>Awaiting Approval</option>
      <option value={4}>Approved</option>
    </Select>
  );
}

const renderSelectEditInputCell: GridColDef["renderCell"] = (params) => {
  return <SelectEditInputCell {...params} />;
};

interface Props {
  projectItems: IProjectItem[];
  setProjectItems: any;
}

export const ProjectDetailsTable: React.FC<Props> = ({ projectItems }) => {
  const navigate = useNavigate();

  const handleAddLine = () => {
    setRows([
      ...rows,
      {
        id: Math.random() * 100,
      },
    ]);
  };

  const [rows, setRows] = React.useState<any>(null);
  React.useEffect(() => {
    setRows([
      {
        id: 123,
        name: "agwdfgasgd",
        product_name: "afhsdjmyhm",
        assigned_user: "Jimmy",
        status: 2,
        product_status: 4,
      },
      {
        id: 124,
        name: "agwdfgasgd",
        product_name: "afhsdjmyhm",
        assigned_user: "Daniel",
        status: 2,
        product_status: 4,
      },
      {
        id: 125,
        name: "agwaesgd",
        product_name: "wwdaf",
        assigned_user: "Frank",
        status: 3,
        product_status: 4,
      },
    ]);
  }, []);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Request Flavor Name",
      width: 300,
      editable: true,
    },
    {
      field: "product_name",
      headerName: "Internal Product",
      width: 300,
      editable: true,
    },
    {
      field: "assigned_user",
      headerName: "Assignee",
      width: 200,
      editable: true,
    },
    {
      field: "product_status",
      headerName: "Regulatory Status",
      editable: true,
      width: 200,
      renderEditCell: renderSelectEditInputCell,
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
    {
      field: "status",
      headerName: "Status",
      editable: true,
      width: 200,
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
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 250,
      renderCell: (params: GridRenderCellParams<string>) => {
        // const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        return (
          <strong>
            <Button
              color="primary"
              variant="contained"
              size="small"
              onClick={() =>
                navigate(`/products/${params.value}`, { replace: false })
              }
            >
              View Product
            </Button>
          </strong>
        );
      },
    },
  ];

  if (rows == null) return null;
  return (
    <>
      <Box component="div" sx={{ display: "inline" }}>
        <Button
          size="large"
          variant="outlined"
          onClick={handleAddLine}
          sx={{ marginRight: 4 }}
        >
          + Add Line
        </Button>
      </Box>

      <DataGrid
        style={{
          border: "1px solid #c9c9c9",
        }}
        rows={rows}
        columns={columns}
        autoHeight={true}
        rowHeight={45}
        editMode="row"
        experimentalFeatures={{ newEditingApi: true }}
        // hideFooter
        hideFooterPagination
        // rowCount={listOptions!.totalDocs}
      />
    </>
  );
};
