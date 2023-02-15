import {
  Avatar,
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";

import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import { IProjectItem } from "../../logic/project.logic";
import TableAutocomplete from "../utils/TableAutocomplete";
import { ObjectID } from "bson";
import { IFormulaItem } from "../../logic/formula.logic";
import { IInventory } from "../../logic/inventory.logic";
import { IUser } from "../../logic/user.logic";
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
      sx={{
        height: 1,
        width: "100%",
      }}
    >
      <MenuItem value={1}>Pending</MenuItem>
      <MenuItem value={2}>In Progress</MenuItem>
      <MenuItem value={3}>Awaiting Approval</MenuItem>
      <MenuItem value={4}>Approved</MenuItem>
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

export const ProjectDetailsTable: React.FC<Props> = ({
  projectItems,
  setProjectItems,
}) => {
  const navigate = useNavigate();

  const handleEditProductRow = (rowid: string, value: IInventory) => {
    let pList = projectItems.slice();
    const rowIdx = projectItems.findIndex((r) => r._id === rowid);
    pList[rowIdx].product_code = value.product_code;
    pList[rowIdx].product_id = value._id;
    pList[rowIdx].product_name = value.name;

    setProjectItems(pList);
  };
  const handleEditAsigneeRow = (rowid: string, value: IUser) => {
    let pList = projectItems.slice();
    const rowIdx = projectItems.findIndex((r) => r._id === rowid);
    pList[rowIdx].assigned_user = value;

    setProjectItems(pList);
  };

  const handleAddRow = () => {
    setProjectItems([
      ...projectItems,
      {
        _id: new ObjectID().toHexString(),
        flavor_name: "",
        product_id: "",
        status: 1,
        product_status: 1,
        product_name: "",
        product_code: "",
        // code:""
      },
    ]);
  };

  const handleDeleteRow = (row_id: string) => {
    const rowIdx = projectItems.findIndex((r) => r._id === row_id);

    let pList = projectItems.slice();
    pList.splice(rowIdx, 1);
    setProjectItems(pList);
  };

  // React.useEffect(() => {
  //   //user came out of edit mode
  //   console.log(rows);
  //   if (editMode == null) {
  //     setProjectItems(rows);
  //   }
  // }, [editMode]);

  const columns: GridColDef[] = [
    {
      field: "flavor_name",
      headerName: "Request Flavor Name",
      width: 300,
      editable: true,
    },
    {
      field: "product_name",
      headerName: "Internal Product",
      width: 300,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          dbOption="products"
          handleEditRow={handleEditProductRow}
          rowParams={row_params}
          initialValue={row_params.row.product_name}
          letterMin={3}
          getOptionLabel={(item: IInventory) =>
            `${item.product_code} | ${item.name}`
          }
        />
      ),
    },
    {
      field: "assigned_user",
      headerName: "Assignee",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          dbOption="user"
          handleEditRow={handleEditAsigneeRow}
          rowParams={row_params}
          initialValue={
            row_params.row.assigned_user
              ? row_params.row.assigned_user.username
              : ""
          }
          letterMin={1}
          getOptionLabel={(item: IUser) => (
            <>
              <Avatar sx={{ mr: 2 }} />
              {item.username}
            </>
          )}
        />
      ),
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
      renderEditCell: renderSelectEditInputCell,
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
      field: "product_id",
      headerName: "Actions",
      align: "left",
      width: 250,
      renderCell: (params: GridRenderCellParams<string>) => {
        // const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        return (
          <div>
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
            <IconButton
              onClick={() => handleDeleteRow(params.row._id)}
              aria-label="delete"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        );
      },
    },
  ];

  // if (rows == null) return null;
  return (
    <>
      <Box component="div" sx={{ display: "inline" }}>
        <Button
          size="large"
          variant="outlined"
          onClick={handleAddRow}
          sx={{ mb: 2 }}
        >
          + Add Row
        </Button>
      </Box>

      <DataGrid
        style={{
          border: "1px solid #c9c9c9",
        }}
        rows={projectItems}
        columns={columns}
        autoHeight={true}
        rowHeight={45}
        editMode="cell"
        getRowId={(row) => row._id}
        experimentalFeatures={{ newEditingApi: true }}
        onCellKeyDown={(params, event) => {
          if (event.code == "Space") {
            event.stopPropagation();
          }
        }}
        processRowUpdate={(newRow) => {
          let pList = projectItems.slice();
          const rowIdx = projectItems.findIndex((r) => r._id === newRow._id);
          pList[rowIdx] = newRow;
          setProjectItems(pList);
          return newRow;
        }}
        onProcessRowUpdateError={(e) => {
          console.error("onProcessRowUpdateError", e);
        }}
        // hideFooter
        hideFooterPagination
        // rowCount={listOptions!.totalDocs}
      />
    </>
  );
};
