import {
  Avatar,
  Box,
  Button,
  Chip,
  Link,
  MenuItem,
  Select,
  Menu,
  SelectChangeEvent,
  darkScrollbar,
} from "@mui/material";
import React, { useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import { IProjectItem } from "../../logic/project.logic";
import TableAutocomplete from "../utils/TableAutocomplete";
import { ObjectID } from "bson";
import { IFormulaItem } from "../../logic/formula.logic";
import { IInventory } from "../../logic/inventory.logic";
import { IUser } from "../../logic/user.logic";
import { MoreHoriz } from "@mui/icons-material";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  MultiDropdownCell,
  SingleDropdownCell,
} from "../utils/TableComponents";

const ItemStatus = [
  [1, "Pending", "error"],
  [2, "In Progress", "warning"],
  [3, "Waiting QC", "warning"],
  [4, "Submitted", "info"],
  [5, "Approved", "success"],
  [6, "Cancelled", "error"],
  [7, "Testing", "info"],
  [8, "Remake", "warning"],
];

const RegulatoryStatus = [
  [1, "ART", "error"],
  [2, "NAT", "success"],
  [3, "NATI", "info"],
  [4, "N&A", "warning"],
];

const DietaryStatus = [
  [1, "KOSH", "info"],
  [2, "VEGA", "success"],
  [3, "ORGA", "warning"],
  [4, "NGMO", "error"],
  [5, "HALA", "info"],
  [6, "VEGE", "success"],
];

const styles = {
  reg_div: {
    scroll: {
      height: "5px",
      color: "black",
    },
  },
};

interface ActionProps {
  tableParams: GridRenderCellParams<string>;
  handleDeleteRow: (id: string) => void;
}

const TableActions: React.FC<ActionProps> = ({
  tableParams,
  handleDeleteRow,
}) => {
  // const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleApprove = () => {
    window.dispatchEvent(
      new CustomEvent("ValidateForm", {
        detail: {
          formType: "approve",
          onSubmit: () => {
            console.log("OBJECT APPROVED");
          },
        },
      })
    );

    handleClose();
  };
  const handleDelete = () => {
    window.dispatchEvent(
      new CustomEvent("ValidateForm", {
        detail: {
          formType: "delete",
          onSubmit: () => {
            console.log("OBJECT DELETED");
            handleDeleteRow(tableParams.id.toString());
          },
        },
      })
    );

    handleClose();
  };

  return (
    <div>
      <IconButton
        color="primary"
        size="small"
        // disabled={!tableParams.row.product_id || tableParams.row.product_id === "" }
        onClick={
          () => {}
          // navigate(`/products/${tableParams.row.product_id}`, { replace: false })
        }
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
      <IconButton onClick={handleClick} color="primary">
        <MoreHoriz />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        sx={{ border: "1px solid #00000015" }}
        PaperProps={{
          elevation: 0,
          sx: {
            width: 150,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 0.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateX(15px) translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem
          sx={{ background: "#00806015", color: "#008060", p: 2 }}
          onClick={handleApprove}
        >
          <CheckCircleOutlineIcon sx={{ mr: 2 }} /> Approve
        </MenuItem>
        <MenuItem sx={{ p: 2 }} onClick={handleClose}>
          <HelpOutlineIcon sx={{ mr: 2 }} /> Details
        </MenuItem>
        <MenuItem
          sx={{ background: "#ff221115", color: "#ff2211", p: 2 }}
          onClick={handleDelete}
        >
          <DeleteOutlineIcon sx={{ mr: 2 }} /> Delete
        </MenuItem>
      </Menu>
    </div>
  );
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
    pList[rowIdx].product_code = value ? value.product_code : "";
    pList[rowIdx].product_id = value ? value._id : "";
    pList[rowIdx].product_name = value ? value.name : "";

    setProjectItems(pList);
  };
  const handleEditAsigneeRow = (rowid: string, value: IUser) => {
    let pList = projectItems.slice();
    const rowIdx = projectItems.findIndex((r) => r._id === rowid);
    pList[rowIdx].assigned_user = value;

    setProjectItems(pList);
  };
  const handleEditStatus = (rowid: string, value: number | string) => {
    let pList = projectItems.slice();
    const rowIdx = projectItems.findIndex((r) => r._id === rowid);

    //@ts-ignore
    pList[rowIdx].status = value;

    setProjectItems(pList);
  };
  const handleEditRegStatus = (rowid: string, value: number | string) => {
    let pList = projectItems.slice();
    const rowIdx = projectItems.findIndex((r) => r._id === rowid);

    //@ts-ignore
    pList[rowIdx].regulatory_status = value;

    setProjectItems(pList);
  };
  const handleEditDietStatus = (rowid: string, value: number | string) => {
    let pList = projectItems.slice();
    const rowIdx = projectItems.findIndex((r) => r._id === rowid);
    //@ts-ignore
    pList[rowIdx].dietary_status.push(value);
    // pList[rowIdx].dietary_status = pList[rowIdx].dietary_status.push(value);

    setProjectItems(pList);
  };

  const handleAddRow = () => {
    setProjectItems([
      ...projectItems,
      {
        _id: new ObjectID().toHexString(),
        flavor_name: "",
        product_id: "",
        product_name: "",
        product_code: "",
        regulatory_status: [1],
        assigned_user: null,
        dietary_status: [1],
        notes: "",
        application: "",
        priority: 0,
        status: 1,
      },
    ]);
  };

  const handleDeleteRow = (row_id: string) => {
    const rowIdx = projectItems.findIndex((r) => r._id === row_id);

    let pList = projectItems.slice();
    pList.splice(rowIdx, 1);
    setProjectItems(pList);
  };

  const columns: GridColDef[] = [
    {
      field: "product_id",
      headerName: "Actions",
      align: "left",
      width: 90,
      renderCell: (params: GridRenderCellParams<string>) => {
        // const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        return (
          <TableActions
            tableParams={params}
            handleDeleteRow={handleDeleteRow}
          />
        );
      },
    },
    {
      field: "flavor_name",
      headerName: "Request Flavor Name",
      width: 170,
      editable: true,
    },
    {
      field: "status",
      headerName: "Status",
      editable: false,
      width: 120,
      align: "center",
      renderCell: (params: GridRenderCellParams<number>) => (
        <SingleDropdownCell
          handleEditRow={handleEditStatus}
          id={params.id}
          value={params.value}
          field={params.field}
          options={ItemStatus}
        />
      ),
    },
    {
      field: "notes",
      headerName: "Notes",
      width: 350,
      editable: true,
    },
    {
      field: "assigned_user",
      headerName: "Assignee",
      width: 130,
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
          letterMin={0}
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
      field: "regulatory_status",
      headerName: "Reg Status",
      editable: false,
      width: 90,
      renderCell: (params: GridRenderCellParams<number>) => (
        <SingleDropdownCell
          handleEditRow={handleEditRegStatus}
          id={params.id}
          value={params.value}
          field={params.field}
          options={RegulatoryStatus}
        />
      ),
    },
    {
      field: "dietary_status",
      headerName: "Diet Status",
      editable: false,
      width: 150,
      renderCell: (params: GridRenderCellParams<number>) => (
        <MultiDropdownCell
          handleEditRow={handleEditDietStatus}
          id={params.id}
          value={params.value}
          field={params.field}
          options={DietaryStatus}
        />
      ),
    },
    {
      field: "product_name",
      headerName: "Internal Product",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          dbOption="product"
          handleEditRow={handleEditProductRow}
          rowParams={row_params}
          initialValue={
            row_params.row.product_code + " | " + row_params.row.product_name
          }
          letterMin={0}
          getOptionLabel={(item) =>
            item ? `${item.product_code} | ${item.name}` : ""
          }
        />
      ),
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
        getRowHeight={() => "auto"}
        // rowHeight={70}
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
