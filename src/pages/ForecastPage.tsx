import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridFooter,
  GridFooterContainer,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import React from "react";
import { AuthContext } from "../components/navigation/AuthProvider";
import { DataTable } from "../components/utils/DataTable";
import {
  calculateForecast,
  IForecast,
  IForecastResults,
  IProductLine,
} from "../logic/forecast.logic";
import Delete from "@mui/icons-material/Delete";
import TableAutocomplete from "../components/utils/TableAutocomplete";
import { IInventory } from "../logic/inventory.logic";
import { ObjectID } from "bson";
import { useNavigate } from "react-router-dom";
import { darken, lighten } from "@mui/material/styles";
import { IProduct, lookupProducts } from "../logic/product.logic";
import LinearProgress from "@mui/material/LinearProgress";

const getClassName = (row: IForecastResults) => {
  if (row.required_amount <= row.available_amount) {
    return row.available_amount +
      row.in_transit_amount +
      row.on_hand_amount -
      row.required_amount <=
      row.reorder_amount
      ? "BlueRow"
      : "";
  } else if (row.required_amount <= row.available_amount + row.ordered_amount) {
    return "YellowRow";
  } else {
    return "RedRow";
  }
};

export const ForecastPage = () => {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const auth = React.useContext(AuthContext);
  const [rowCount, setRowCount] = React.useState(0);
  let testRef = React.useRef<HTMLDivElement>();
  const [forceRecursion, setForceRecursion] = React.useState<boolean>(false);
  const [file, setFile] = React.useState();
  const forecastColumns: GridColDef[] = [
    {
      field: "product_id",
      headerName: "Actions",
      align: "left",
      width: 70,
      renderCell: (params: GridRenderCellParams<string>) => {
        // const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        return (
          <div>
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
    { field: "product_code", headerName: "Product Code", width: 150 },
    {
      field: "product_name",
      headerName: "Product Name",
      width: 350,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          dbOption="approved-product-all"
          handleEditRow={handleEditProductRow}
          rowParams={row_params}
          initialValue={row_params.row.product_name}
          letterMin={3}
          getOptionLabel={(item: IInventory) =>
            item ? `${item.product_code} | ${item.name}` : ""
          }
        />
      ),
    },
    {
      field: "amount",
      headerName: "Quantity",
      type: "number",
      width: 150,
      editable: true,
    },
  ];

  const materialColumns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 150 },
    {
      field: "product_name",
      headerName: "Material Name",
      width: 300,
    },
    {
      field: "required_amount",
      headerName: "Required Qty",
      type: "number",
      width: 150,
      valueGetter: (params) =>
        params.row.required_amount
          ? params.row.required_amount.toFixed(15)
          : "error",
    },
    {
      field: "available_amount",
      headerName: "Available Qty",
      type: "number",
      width: 150,
    },
    {
      field: "ordered_amount",
      headerName: "Ordered Qty",
      type: "number",
      width: 150,
    },
    {
      field: "on_hand_amount",
      headerName: "On Hand Qty",
      type: "number",
      width: 150,
    },
  ];

  const [rows, setRows] = React.useState<IProductLine[]>([
    {
      _id: new ObjectID().toHexString(),
      product_id: "",
      product_code: "",
      product_name: "",
      amount: 0,
    },
  ]);
  const [materialRows, setMaterialRows] = React.useState<
    IForecastResults[] | null
  >(null);

  const handleDeleteRow = (row_id: string) => {
    const rowIdx = rows.findIndex((r) => r._id === row_id);

    let pList = rows.slice();
    pList.splice(rowIdx, 1);
    setRows(pList);
  };

  const handleAddLine = (lineProduct: IProductLine) => {
    const index = rows.indexOf(lineProduct) + 1;
    setRows([
      ...rows.slice(0, index),
      {
        _id: new ObjectID().toHexString(),
        product_id: "",
        product_code: "",
        product_name: "",
        amount: 0,
      },
      ...rows.slice(index, rows.length),
    ]);
  };
  const handleRemoveLine = (lineProduct: IProductLine) => {
    if (rows.length <= 1) return;
    const index = rows.indexOf(lineProduct);

    if (index >= 0) {
      rows.splice(index, 1);
      setRows([...rows]);
    }
  };

  const handleEditProductRow = (rowid: string, value: IInventory) => {
    let pList = rows!.slice();
    const rowIdx = rows!.findIndex((r) => r._id === rowid);
    pList[rowIdx].product_code = value.product_code;
    pList[rowIdx].product_id = value._id;
    pList[rowIdx].product_name = value.name;

    setRows(pList);
  };

  const handleEditCell = (row_id: string, field: string, value: any) => {
    const rowIndex = rows.findIndex((r: IProductLine) => r._id === row_id);
    setRows([
      ...rows.slice(0, rowIndex),
      {
        ...rows[rowIndex],
        [field]: value,
      },
      ...rows.slice(rowIndex == rows.length ? rowIndex : rowIndex + 1),
    ]);
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        _id: new ObjectID().toHexString(),
        product_id: "",
        product_name: "",
        product_code: "",
        amount: 0,
      },
    ]);
    setRowCount(rowCount + 1);
  };

  const fileReader = new FileReader();

  const handleOnChange = (e: any) => {
    setFile(e.target.files[0]);
    // console.log(e.target.files[0])
  };

  const csvFileToArray = async (textFile: string) => {
    // console.log(JSON.stringify(textFile), "testFile")
    textFile = textFile.replace(/[\r\n]+/gm, "\n");
    const csvHeader = textFile.slice(0, textFile.indexOf("\n")).split(",");
    // console.log(csvHeader, "BRUH")
    const csvRows = textFile.slice(textFile.indexOf("\n") + 1).split("\n");
    let product_codes: any[] = [];
    let unfound_products: any[] = [];
    let final_array: any[] = [];
    const value_array = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object: any, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      product_codes = [...product_codes, obj.CODE];
      return obj;
    });
    //looking up imported values
    lookupProducts(product_codes).then((products: IProduct[] | null) => {
      //setting rows to imported values
      value_array.map((element1) => {
        if (
          products?.find(
            (element) => element1.CODE === element.product_code
          ) === undefined
        ) {
          unfound_products = [...unfound_products, element1.CODE + "\n"];
        }
      });
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: {
            color: "warning",
            text: "Could not find: " + unfound_products,
          },
        })
      );
      for (const imported_product of value_array) {
        const product: IProduct | undefined = products!.find(
          (element) =>
            imported_product.AMOUNT !== undefined &&
            element.product_code === imported_product.CODE
        );
        if (product) {
          final_array.push({
            _id: new ObjectID().toHexString(),
            product_id: product!._id,
            product_code: product!.product_code,
            product_name: product!.name,
            amount: imported_product.AMOUNT,
          });
        }
      }
      // const imported_rows = value_array!.map((imported_product:{CODE:string, AMOUNT:number}) => {
      setRows(final_array);
    });
  };

  const handleOnSubmit = (e: any) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event: any) {
        const text = event?.target.result;
        csvFileToArray(text);
      };

      fileReader.readAsText(file);
    }
  };

  const handleCalculate = () => {
    if (rows.length === 0) {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: { color: "error", text: "Rows Are Empty!" },
        })
      );
      return;
    }
    const zero_amt = rows.find((x) => x.amount <= 0 || x.product_id === "");
    if (zero_amt != undefined) {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: {
            color: "error",
            text:
              zero_amt.product_id === ""
                ? "Empty Row!"
                : zero_amt.product_code + " Has an Invalid Qty!",
          },
        })
      );
      return;
    }
    setLoading(true);

    //TODO:Remove elements that are not filled in

    const forecastList: IForecast[] = rows.map((line) => {
      return {
        product_id: line.product_id,
        product_name: line.product_name,
        product_code: line.product_code,
        amount: line.amount,
      };
    });
    console.log(forceRecursion, "TETS");
    calculateForecast(forecastList, forceRecursion).then(
      (result: IForecastResults[]) => {
        // console.log(result);
        const newRows = result.map((item, idx) => {
          return {
            id: idx,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            required_amount: item.required_amount,
            available_amount: item.available_amount,
            ordered_amount: item.ordered_amount,
            on_hand_amount: item.on_hand_amount,
            in_transit_amount: item.in_transit_amount,
            reorder_amount: item.reorder_amount,
          };
        });

        setMaterialRows(newRows);
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: { color: "success", text: "Success!" },
          })
        );
        setLoading(false);

        testRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        }); //with just one it doesn't work sometimes lol..
        testRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    );
  };

  const CustomPagination = () => {
    return (
      <GridFooterContainer>
        <Button
          size="medium"
          variant="outlined"
          onClick={handleAddRow}
          sx={{ ml: 1, borderRadius: 10, borderStyle: "dashed" }}
        >
          + Add Row
        </Button>
        <GridFooter
          sx={{
            border: "none", // To delete double border.
          }}
        />
      </GridFooterContainer>
    );
  };

  return (
    <>
      <Card variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <div>
            <Button
              size="medium"
              variant="contained"
              sx={{ marginBottom: 2, marginRight: 1 }}
              onClick={(e) => {
                handleOnSubmit(e);
              }}
            >
              IMPORT CSV
            </Button>
            <input
              type={"file"}
              id={"csvFileInput"}
              accept={".csv"}
              onChange={handleOnChange}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <Button size="medium" variant="contained" onClick={handleCalculate}>
              Calculate
            </Button>
            <Checkbox
              value={forceRecursion}
              onClick={() => {
                setForceRecursion(!forceRecursion);
              }}
            />
            Force Recursion?
            <Fade
              in={loading}
              style={{
                transitionDelay: loading ? "250ms" : "0ms",
                width: 25,
                height: 25,
              }}
              unmountOnExit
            >
              <CircularProgress />
            </Fade>
          </div>
        </Box>
        <DataGrid
          style={{
            border: "1px solid #c9c9c9",
          }}
          rows={rows}
          columns={forecastColumns}
          autoHeight={true}
          pagination
          density={"compact"}
          getCellClassName={(params: GridCellParams<number>) => {
            if (params.field === "amount") {
              return params.row.amount > 0 ? "" : "RedRow";
            }
            return "";
          }}
          // rowHeight={45}
          onCellKeyDown={(params, event) => {
            if (event.code == "Space") {
              event.stopPropagation();
            }
          }}
          getRowId={(row) => row._id}
          processRowUpdate={(newRow) => {
            let pList = rows.slice();
            const rowIdx = rows.findIndex((r) => r.product_id === newRow._id);
            pList[rowIdx] = newRow;
            setRows(pList);
            return newRow;
          }}
          onProcessRowUpdateError={(e) => {
            console.error("onProcessRowUpdateError", e);
          }}
          onCellEditCommit={(e, value) => {
            // console.log("test", e, value);
            handleEditCell(e.id.toString(), e.field, e.value);
          }}
          // hideFooterPagination
          components={{
            Footer: CustomPagination,
            Toolbar: GridToolbar,
          }}
          // hideFooter
          // rowCount={listOptions!.totalDocs}
        />
      </Card>
      {materialRows ? (
        <Card
          ref={(element: any) => (testRef!.current = element)}
          style={{
            marginTop: 2,
            padding: 5,
            scrollMarginTop: 350,
            overflow: "clip",
          }}
        >
          <Typography variant="h6" sx={{ textAlign: "center", mb: 0.5 }}>
            Forecast Results
          </Typography>
          <DataGrid
            rows={materialRows!}
            getRowClassName={(params) => getClassName(params.row)}
            getRowId={(row) => row.product_id}
            columns={materialColumns}
            autoHeight={true}
            density={"compact"}
            components={{ Toolbar: GridToolbar }}
          />
        </Card>
      ) : null}
    </>
  );
};
