import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import TableAutocomplete from "../components/utils/TableAutocomplete";
import { ICountItem } from "../logic/stock-count.logic";
import { IInventory } from "../logic/inventory.logic";
import { ObjectID } from "bson";
import SaveForm from "../components/forms/SaveForm";
import StandaloneAutocomplete from "../components/utils/StandaloneAutocomplete";
import { ISupplier } from "../logic/supplier.logic";
import { confirmStockCount, createStockCount, getStockCount, IStockCount, markStockCountCancelled, markStockCountReceived, updateStockCount } from "../logic/stock-count.logic";

let savedStockCount: IStockCount | null = null;

const StockCountStatus = [
  ["AWAITING SHIPPING", "warning"],
  ["AWAITING ARRIVAL", "warning"],
  ["PARTIALLY RECEIVED", "success"],
  ["RECEIVED", "success"],
  ["ABANDONED", "error"],
  ["DRAFT", "warning"],
];

export const StockCountDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);

  const handleEditProductRow = (rowid: string, value: IInventory) => {
    let pList = rows!.slice();
    const rowIdx = rows!.findIndex((r: any) => r._id === rowid);
    pList[rowIdx].product_code = value.product_code;
    pList[rowIdx].product_id = value._id;
    pList[rowIdx].product_name = value.name;
    setRows(pList);
  };

  const emptyStockCount: IStockCount = {
    _id: "",
    status: 6,
    date_proposed:"",
    order_code: "",
    count_items: [],
    notes: "",
  };

  const [stockCountSaved, setStockCountSaved] = React.useState<boolean>(true);
  const [stockCount, setStockCount] = React.useState<IStockCount | null>(
    null
  );

  const [rows, setRows] = React.useState<ICountItem[]>([]);
  const [receiveMode, setReceiveMode] = React.useState<boolean>(false);

  useEffect(() => {
    if (id === "new") {
      savedStockCount = emptyStockCount;
      setStockCount(emptyStockCount);
      setRows([]);
    } else {
      getStockCount(auth.token, id!).then((p) => {
        const tempStockCount = { ...p! };
        savedStockCount = tempStockCount;
        setStockCount(p!);
        console.log(p);
        // newRows = stockCount!.count_items.map((item) => { //!check soon for further changes
        //   return {
        //     _id: item._id ? item._id : new ObjectID().toHexString(),
        //     product_code: item.product_code,
        //     product_name: item.product_name,
        //     unit_price: item.unit_price,
        //     stockCountd_amount: item.stockCountd_amount,
        //     received_amount: item.received_amount,
        //     lot_number: '',
        //     container_size: null,
        //     process_amount: null,
        //     expiry_date:'',
        //     notes:'',
        //     remaining_amount: item.stockCountd_amount - item.received_amount,
        //   };
        // });
        setRows(
          p!.count_items.map((item:ICountItem) => {
            item._id = item._id ? item._id : new ObjectID().toHexString();
            return item;
          })
        );
        setReceiveMode(p!.status <= 3);
        // setStockCountSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (stockCount == null) return;
    setReceiveMode(stockCount.status <= 3);

    if (stockCountSaved === false) return;

    if (JSON.stringify(savedStockCount) !== JSON.stringify(stockCount)) {
      setStockCountSaved(false);
    }
  }, [stockCount]);

  useEffect(() => {
    //temp maybe
    if (rows.length != 0 && rows != null && !receiveMode) {
      if (JSON.stringify(savedStockCount?.count_items) !== JSON.stringify(rows)) {
        setStockCountSaved(false);
      }

      const tempStockCount = { ...stockCount! }; // gotta find a nicer way around this lol..
      tempStockCount.count_items = rows;
      setStockCount(tempStockCount);
    }
  }, [rows]);

  const receiveColumns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 150, editable: false },
    { field: "product_name", headerName: "Product Name", width: 280, editable: false, renderCell: undefined },
    {
      field: "stockCountd_amount",
      headerName: "Container Qty(KG)",
      type: "number",
      width: 110,
      align: "center",
      editable: false
    },
    {
      field: "received_amount",
      headerName: "Received Qty",
      type: "number",
      width: 100,
      align: "center",
      editable: false
    },
    {
      field: "remaining_amount",
      headerName: "Awaiting Qty",
      type: "number",
      width: 100,
      align: "center",
      editable: false,
      valueGetter: (params) =>
        params.row.stockCountd_amount - params.row.received_amount,
    },
    {
      field: "unit_price",
      headerName: "Cost($/KG)",
      type: "number",
      width: 100,
      align: "center",
      editable: false
    },
    {
      field: "lot_number",
      headerName: "Lot#",
      type: "string",
      width: 120,
      editable: true,
      align: "right",
    },
    {
      field: "container_size",
      headerName: "Cont Size(KG)",
      type: "number",
      width: 120,
      editable: true,
      align: "center",
    },
    {
      field: "process_amount",
      headerName: "Qty to Process",
      type: "number",
      width: 120,
      editable: true,
      align: "center",
    },
    {
      field: "expiry_date",
      headerName: "Exp Date",
      type: "date",
      width: 120,
      editable: true,
      align: "center",
    },
  ];
  const draftColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 80,
      renderCell: (params: GridRenderCellParams<string>) => (
        <div>
          <IconButton
            disabled={stockCount!.status !== 6}
            onClick={() => handleDeleteRow(params.row._id)}
            aria-label="delete"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
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
          dbOption="inventory"
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
      field: "stockCountd_amount",
      headerName: "Stock Count Qty(KG)",
      type: "number",
      width: 110,
      align: "center",
      editable: true,
    },
    {
      field: "unit_price",
      headerName: "Cost($/KG)",
      type: "number",
      width: 100,
      align: "center",
      editable: true,
    },
    {
      field: "received_amount",
      headerName: "Received Qty",
      type: "number",

      width: 100,
      align: "center",
      editable: true,
    },
  ];

  const handleConfirmStockCount = () => {
    confirmStockCount(auth.token, stockCount!, stockCount!._id).then((_stockCount) => {
      if (_stockCount) {
        // window.location.reload();
        savedStockCount = _stockCount;
        setStockCount(_stockCount);
        setStockCountSaved(true);
      } else {
        console.log("Stock Count Not Updated");
      }
    });
  };

  const handleMarkStockCountReceived = () => {
    markStockCountReceived(auth.token, stockCount!._id).then((_stockCount) => {
      if (_stockCount) {
        // window.location.reload();
        savedStockCount = _stockCount;
        setStockCount(_stockCount);
        setStockCountSaved(true);
      } else {
        console.log("Stock Count Not Updated");
      }
    });
  };

  const handleMarkStockCountCancelled = () => {
    markStockCountCancelled(auth.token, stockCount!._id).then((_stockCount) => {
      console.log("cancel stockCount", _stockCount, _stockCount?.status);
      if (_stockCount) {
        savedStockCount = _stockCount;
        setStockCount(_stockCount);
        setStockCountSaved(true);
      } else {
        console.log("Stock Count Not Updated");
      }
    });
  };

  const handleDeleteRow = (row_id: string) => {
    setRows([...rows.filter((m: ICountItem) => m._id !== row_id)]);
  };

  const handleEditCell = (row_id: string, field: string, value: any) => {
    const rowIndex = rows.findIndex((r: any) => r._id === row_id);
    setRows([
      ...rows.slice(0, rowIndex),
      {
        ...rows[rowIndex],
        [field]: value,
      },
      ...rows.slice(rowIndex == rows.length ? rowIndex : rowIndex + 1),
    ]);
  };

  // const handleInsertRow = (row_id: string) => { //!not being used atm
  //   const index = rows.findIndex(
  //     (element: { id: string }) => element.id === row_id
  //   );
  //   setRows([
  //     ...rows.slice(0, index + 1),
  //     {
  //       _id: new ObjectID().toHexString(),
  //       amount: 0,
  //       last_amount: 0,
  //       item_cost: 0,
  //       cost: 0,
  //     },
  //     ...rows.slice(index == rows.length - 1 ? index + 2 : index + 1),
  //   ]);
  // };

  const handleAddRow = () => {
    setRows([
      {
        _id: new ObjectID().toHexString(),
        product_id: "",
        product_code: "",
        product_name: "",
        amount: 0,
        amount_proposed: 0
      },
      ...rows.slice(0),
    ]);
    console.log(rows);
  };

  const saveStockCount = async () => {
    //send new stockCount to server
    if (id === "new") {
      const newStockCountId = await createStockCount(auth.token, stockCount!);
      if (newStockCountId) {
        navigate(`/stock-counts/${newStockCountId}`, { replace: true });
        setStockCount({ ...stockCount!, _id: newStockCountId });
      }
    } else {
      const updated = await updateStockCount(auth.token, stockCount!);

      if (updated === false) {
        throw Error("Update StockCount Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setStockCountSaved(true);
  };
  const cancelSaveStockCount = () => {
    setStockCount(savedStockCount);
    let tempPur = { ...savedStockCount! };
    setRows(tempPur.count_items);
    setStockCountSaved(true);
  };

  if (stockCount == null) return null;

  return (
    <>
      <SaveForm
        display={!stockCountSaved}
        onSave={saveStockCount}
        onCancel={cancelSaveStockCount}
      />

      <Card variant="outlined" sx={{ padding: 2 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 100,
            marginBottom: 10,
          }}
        >
          <div>
            <Button
              sx={{ mb: 3 }}
              aria-label="go back"
              size="medium"
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon
                fontSize="small"
                sx={{
                  marginRight: 1,
                }}
              />
              Stock Count
            </Button>
            <Grid sx={{ maxWidth: "85%" }} container spacing={3}>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setStockCount({
                      ...stockCount,
                      order_code: e.target.value,
                    })
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Stock Count Code"}
                  value={stockCount.order_code}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setStockCount({
                      ...stockCount,
                      date_proposed: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Stock Count Date"}
                  type={"date"}
                  value={stockCount.date_proposed}
                ></TextField>
              </Grid>
              {/* <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setStockCount({
                      ...stockCount,
                      date_arrived: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Arrival Date"}
                  type={"date"}
                  value={stockCount.date_arrived}
                ></TextField>
              </Grid> */}
              <Grid item xs={2}>
                <Chip
                  label={
                    StockCountStatus[
                    stockCount?.status ? stockCount?.status - 1 : 5
                    ][0]
                  }
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                  //@ts-ignore
                  color={
                    StockCountStatus[
                    stockCount?.status ? stockCount?.status - 1 : 5
                    ][1]
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  onChange={(e) =>
                    setStockCount({ ...stockCount, notes: e.target.value })
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Notes"}
                  multiline
                  rows={6}
                  value={stockCount.notes}
                ></TextField>
              </Grid>
            </Grid>
          </div>
          <Card
            variant="outlined"
            style={{
              width: 260,
              minWidth: 260,
              padding: 16,
              display: "flex",

              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <Typography variant="h6">Action Board</Typography>
            </div>
            <Divider></Divider>
            <Button
              style={{
                display: `${stockCount.status === 6 ? "box" : "none"}`,
              }}
              disabled={id === "new"}
              variant="contained"
              onClick={() => handleConfirmStockCount()}
            >
              Confirm
            </Button>

            <Button
              color="success"
              variant="contained"
              disabled={id === "new"}
              onClick={() => handleMarkStockCountReceived()}
            >
              Set as Received
            </Button>
            <Button
              color="error"
              variant="outlined"
              disabled={id === "new"}
              onClick={() => handleMarkStockCountCancelled()}
            >
              Cancel Stock Count
            </Button>
          </Card>
        </div>
      </Card>
      <Card variant="outlined" sx={{ mt: 2, padding: 2, overflowY: "auto" }}>
        <div>
          <Button
            style={{
              marginBottom: 10,
              marginRight: 10,
              display: `${stockCount.status === 6 ? "block" : "none"}`,
            }}
            variant="contained"
            onClick={() => {
              handleAddRow();
            }}
          >
            Add Row
          </Button>
          {/* <Switch color="primary"
          disabled={id=== "new"}
          onChange={() => setReceiveMode(!receiveMode)}/>
          Receive Mode */}
        </div>
        <DataGrid
          autoHeight={true}
          rowHeight={46}
          rows={rows!}
          getRowId={(row) => row._id}
          processRowUpdate={(newRow) => {
            console.log(newRow);
            let pList = rows.slice();
            const rowIdx = rows.findIndex(
              (r: ICountItem) => r._id === newRow._id
            );
            pList[rowIdx] = newRow;
            setRows(pList);
            return newRow;
          }}
          onCellKeyDown={(params, event) => {
            if (event.code == "Space") {
              event.stopPropagation();
            }
            // if (receiveMode !== null) {
            //   switch (event.code) {
            //     case "Escape": {
            //       setReceiveMode(null);
            //       break;
            //     }
            //     // case("Enter"):
            //     // {
            //     //   console.log('test', event, params )
            //     //   break;
            //     // }
            //     case "ArrowDown":
            //     case "ArrowUp":
            //     case "Backspace": {
            //       event.stopPropagation();
            //     }
            //   }
            // }
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                // Hide columns status and traderName, the other columns will remain visible
                received_amount: stockCount.status != 6,
              },
            },
          }}
          columns={receiveMode ? receiveColumns : draftColumns}
          onCellEditCommit={(e, value) => {
            handleEditCell(e.id.toString(), e.field, e.value);
            console.log("test", rows);
          }}
        ></DataGrid>
      </Card>
    </>
  );
};
