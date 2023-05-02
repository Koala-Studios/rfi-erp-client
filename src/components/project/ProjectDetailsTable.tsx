import {
  Avatar,
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  SelectChangeEvent,
  darkScrollbar,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import { IProjectItem } from "../../logic/project.logic";
import TableAutocomplete from "../utils/TableAutocomplete";
import { ObjectID } from "bson";
import { IFormulaItem } from "../../logic/formula.logic";
import { IInventory } from "../../logic/inventory.logic";
import { IUser } from "../../logic/user.logic";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const ItemStatus = [
  ["Pending", "error"],
  ["In Progress", "warning"],
  ["Waiting QC", "warning"],
  ["Submitted", "info"],
  ["Approved", "success"],
  ["Cancelled", "error"],
  ["Testing", "info"],
  ["Remake", "warning"],
];

const RegulatoryStatus = [
  ["ART", "error"],
  ["NAT", "success"],
  ["NATI", "info"],
  ["N&A", "warning"],
];

const DietaryStatus = [
  ["KOSH", "info"],
  ["VEGA", "success"],
  ["ORGA", "warning"],
  ["NGMO", "error"],
  ["HALA", "info"],
  ["VEGE", "success"],
];

const styles = {
  reg_div: {
    scroll: {
      height:'5px',
      color:'black'
    }
  }
}

function SelectEditInputCell(props: GridRenderCellParams) {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  const handleChange = async (event: SelectChangeEvent) => {
    await apiRef.current.setEditCellValue({
      id,
      field,
      value: event.target.value,
    });
    // apiRef.current.stopCellEditMode({ id, field });
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
    pList[rowIdx].product_code = value ? value.product_code : '';
    pList[rowIdx].product_id = value ? value._id : '';
    pList[rowIdx].product_name = value ? value.name : '';

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
        product_name: "",
        product_code: "",
        regulatory_status: [1],
        assigned_user: null,
        dietary_status:[1],
        notes:"",
        application:"",
        priority:0,
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
      width: 275,
      editable: true,
    },
    {
      field: "product_name",
      headerName: "Int Product",
      width: 250,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          dbOption="product"
          handleEditRow={handleEditProductRow}
          rowParams={row_params}
          initialValue={row_params.row.product_code + ' | ' + row_params.row.product_name}
          letterMin={3}
          getOptionLabel={(item) =>
            item.product_code ?
            `${item.product_code} | ${item.name}` : item
          }
        />
      ),
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
      field: "regulatory_status",
      headerName: "Reg Status",
      editable: true,
      width:120,
      renderEditCell: renderSelectEditInputCell,
      renderCell: (params: GridRenderCellParams<number>) => {
        let chips = [];
        //@ts-ignore
        // <div>
          
          { for(let i = 0; i < params?.value!.length ; i++) {
            console.log(params?.value)
          chips.push(
            <Chip
            //@ts-ignore
            label={RegulatoryStatus[params.value ? params?.value![i] - 1 : 4][0]}
            sx={{
              fontWeight: 600,
              marginRight:1
            }}
            size="small"
            //@ts-ignore
            color={RegulatoryStatus[params.value ? params?.value![i] - 1 : 4][1]}
            variant="outlined"
          />
          )
          }
          return <div>{chips}</div>; } //TODO: Show overflow..
          
    },

    },
    {
      field: "dietary_status",
      headerName: "Diet Status",
      editable: true,
      width: 120,
      renderEditCell: renderSelectEditInputCell,
      renderCell: (params: GridRenderCellParams<number>) => {
        let chips = [];
        //@ts-ignore
          for(let i = 0; i < params?.value!.length ; i++) {
            console.log(params?.value)
          chips.push(
            <Chip
            length={50}
            size="small"
            //@ts-ignore
            label={DietaryStatus[params.value ? params?.value![i] - 1 : 4][0]}
            sx={{
              fontWeight: 600,
              marginRight:1,
              
            }}
            //@ts-ignore
            color={DietaryStatus[params.value ? params?.value![i] - 1 : 4][1]}
            variant="outlined"
          />
          )
          }
          return chips;
    },
    },
    {
      field: "status",
      headerName: "Status",
      editable: true,
      renderEditCell: renderSelectEditInputCell,
      width: 120,
      align:'center',
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={ItemStatus[params.value ? params.value - 1 : 4][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={ItemStatus[params.value ? params.value - 1 : 4][1]}
          variant="outlined"
        />
      ),
    },
    {
      field: "product_id",
      headerName: "Actions",
      align: "left",
      width: 170,
      renderCell: (params: GridRenderCellParams<string>) => {
        // const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        return (
          <div>
            <Button
              color="primary"
              variant="contained"
              size="small"
              disabled={!params.row.product_id || params.row.product_id === "" }
              onClick={() =>
                navigate(`/products/${params.row.product_id}`, { replace: false })
              }
            >
              <VisibilityIcon fontSize="small"/>
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
