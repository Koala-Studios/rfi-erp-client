import { Box, Button, Card, IconButton, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { AuthContext } from "../components/navigation/AuthProvider";
import { DataTable } from "../components/utils/DataTable";
import {
  calculateForecast,
  IForecast,
  IProductLine,
} from "../logic/forecast.logic";
import Delete from "@mui/icons-material/Delete";
import TableAutocomplete from "../components/utils/TableAutocomplete";
import { IInventory } from "../logic/inventory.logic";
import { ObjectID } from "bson";
import { useNavigate } from "react-router-dom";

export const ForecastPage = () => {

  
  const navigate = useNavigate();
  const auth = React.useContext(AuthContext);
  const [rowCount, setRowCount] = React.useState(0); 
const forecastColumns: GridColDef[] = [
  { field: "product_code", headerName: "Product Code", width: 150 },
  {
    field: "product_name",
    headerName: "Internal Product",
    width: 350,
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
  { field: "amount", headerName: "Quantity", type: "number", width: 150, editable:true },
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
]
  
const materialColumns: GridColDef[] = [
  { field: "product_code", headerName: "Product Code", width: 150 },
  {
    field: "product_name",
    headerName: "Material Name",
    width: 300,
    sortable: false,
    filterable: false,
  },
  { field: "amount", headerName: "Quantity", type: "number", width: 150 },
];





  const [lineItems, SetLineItems] = React.useState<IProductLine[]>([
    {
      _id: new ObjectID().toHexString(),
      product_id: "",
      product_code: "",
      product_name: "",
      amount: 0,
    },
  ]);
  const [materialRows, setMaterialRows] = React.useState<IForecast[] | null>(
    null
  );


  const handleDeleteRow = (row_id: string) => {
    const rowIdx = lineItems.findIndex((r) => r._id === row_id);

    let pList = lineItems.slice();
    pList.splice(rowIdx, 1);
    SetLineItems(pList);
  };


  const handleAddLine = (lineProduct: IProductLine) => {
    const index = lineItems.indexOf(lineProduct) + 1;
    SetLineItems([
      ...lineItems.slice(0, index),
      {
        
        _id: new ObjectID().toHexString(),
        product_id: "",
        product_code: "",
        product_name: "",
        amount: 0,
      },
      ...lineItems.slice(index, lineItems.length),
    ]);
    
  };
  const handleRemoveLine = (lineProduct: IProductLine) => {
    if (lineItems.length <= 1) return;
    const index = lineItems.indexOf(lineProduct);

    if (index >= 0) {
      lineItems.splice(index, 1);
      SetLineItems([...lineItems]);
    }
  };


  
const handleEditProductRow = (rowid: string, value: IInventory) => {
  let pList = lineItems!.slice();
  const rowIdx = lineItems!.findIndex((r) => r._id === rowid);
  pList[rowIdx].product_code = value.product_code;
  pList[rowIdx].product_id = value._id;
  pList[rowIdx].product_name = value.name;

  SetLineItems(pList);
};

const handleEditCell = (row_id: string, field: string, value: any) => {
  const rowIndex = lineItems.findIndex((r: IProductLine) => r._id === row_id);
  SetLineItems([
    ...lineItems.slice(0, rowIndex),
    {
      ...lineItems[rowIndex],
      [field]: value,
    },
    ...lineItems.slice(rowIndex == lineItems.length ? rowIndex : rowIndex + 1),
  ]);
};

const handleAddRow = () => {
  SetLineItems([
    ...lineItems,
    {
      _id: new ObjectID().toHexString(),
      product_id:"",
      product_name: "",
      product_code: "",
      amount:0,
    },
  ]);
  setRowCount(rowCount+1)
};

  const handleCalculate = () => {
    if (lineItems.length === 0) return;

    //TODO:Remove elements that are not filled in

    const forecastList: IForecast[] = lineItems.map((line) => {
      return { product_id: line.product_id, product_name: line.product_name, product_code: line.product_code, amount: line.amount };
    });



    calculateForecast(auth.token, forecastList).then((result: IForecast[]) => {
      console.log(result)
      const newRows = result.map((item, idx) => {
        return {
          id: idx,
          product_id: item.product_id,
          product_code: item.product_code,
          product_name: item.product_name,
          amount: item.amount,
        };
      });

      setMaterialRows(newRows);
    });
  };

  return (
    <Box component="div">
      <Card
        variant="outlined"
        sx={{ padding: 4, marginBottom: 3 }}
        component="div"
      >
        <Box component="div" sx={{ display: "inline" }}>
          <Button
            size="large"
            variant="outlined"
            onClick={handleAddRow}
            sx={{ marginRight: 4 }}
          >
            + Add Row
          </Button>
          <Button size="large" variant="contained" onClick={handleCalculate}>
            Calculate
          </Button>
        </Box>
          <DataGrid
            style={{
              border: "1px solid #c9c9c9",
            }}
            rows={lineItems}
            columns={forecastColumns}
            autoHeight={true}
            rowHeight={45}
            // editMode="cell"
            getRowId={(row) => row._id}
            // experimentalFeatures={{ newEditingApi: true }}
            processRowUpdate={(newRow) => {
              let pList = lineItems.slice();
              const rowIdx = lineItems.findIndex((r) => r.product_id === newRow._id);
              pList[rowIdx] = newRow;
              SetLineItems(pList);
              return newRow;
            }}
            onProcessRowUpdateError={(e) => {
              console.error("onProcessRowUpdateError", e);
            }}
            onCellEditCommit={(e, value) => {
              console.log('test', e, value)
              handleEditCell(e.id.toString(), e.field, e.value);
            }}
            // hideFooter
            hideFooterPagination
            // rowCount={listOptions!.totalDocs}
          />
      <div/>
      </Card>
      {materialRows ? (
        <Box>
          <DataGrid
            // title="Forecast Results"
            rows={materialRows!}
            columns={materialColumns}
            autoHeight={true}
            rowHeight={45}
          ></DataGrid>
        </Box>
      ) : null}
    </Box>
  );
};
