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
import {
  confirmPurchase,
  createPurchase,
  getPurchase,
  handlePurchaseItem,
  IOrderItemProcess,
  IPurchaseOrder,
  markPurchaseCancelled,
  markPurchaseReceived,
  updatePurchase,
} from "../logic/purchase-order.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import TableAutocomplete from "../components/utils/TableAutocomplete";
import { IOrderItem } from "../logic/purchase-order.logic";
import { IInventory } from "../logic/inventory.logic";
import { ObjectID } from "bson";
import SaveForm from "../components/forms/SaveForm";
import StandaloneAutocomplete from "../components/utils/StandaloneAutocomplete";
import { ISupplier } from "../logic/supplier.logic";

let savedPurchase: IPurchaseOrder | null = null;

const PurchaseStatus = [
  ["AWAITING SHIPPING", "warning"],
  ["AWAITING ARRIVAL", "warning"],
  ["PARTIALLY RECEIVED", "success"],
  ["RECEIVED", "success"],
  ["ABANDONED", "error"],
  ["DRAFT", "warning"],
];

export const PurchaseDetailPage = () => {
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

  const emptyPurchase: IPurchaseOrder = {
    _id: "",
    supplier: { supplier_id: "", name: "" },
    date_arrived: "",
    shipping_code: "",
    date_purchased: "",
    status: 6,
    order_code: "",
    order_items: [],
    notes: "",
  };

  const [purchaseSaved, setPurchaseSaved] = React.useState<boolean>(true);
  const [purchase, setPurchaseOrder] = React.useState<IPurchaseOrder | null>(
    null
  );

  const [rows, setRows] = React.useState<IOrderItem[]>([]);
  const [receiveMode, setReceiveMode] = React.useState<boolean>(false);

  useEffect(() => {
    if (id === "new") {
      savedPurchase = emptyPurchase;
      setPurchaseOrder(emptyPurchase);
      setRows([]);
    } else {
      getPurchase(id!).then((p) => {
        const tempPurchase = { ...p! };
        savedPurchase = tempPurchase;
        setPurchaseOrder(p!);
        console.log(p);
        // newRows = purchase!.order_items.map((item) => { //!check soon for further changes
        //   return {
        //     _id: item._id ? item._id : new ObjectID().toHexString(),
        //     product_code: item.product_code,
        //     product_name: item.product_name,
        //     unit_price: item.unit_price,
        //     purchased_amount: item.purchased_amount,
        //     received_amount: item.received_amount,
        //     lot_number: '',
        //     container_size: null,
        //     process_amount: null,
        //     expiry_date:'',
        //     notes:'',
        //     remaining_amount: item.purchased_amount - item.received_amount,
        //   };
        // });
        setRows(
          p!.order_items.map((item) => {
            item._id = item._id ? item._id : new ObjectID().toHexString();
            return item;
          })
        );
        setReceiveMode(p!.status <= 3);
        // setPurchaseSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (purchase == null) return;
    setReceiveMode(purchase.status <= 3);

    if (purchaseSaved === false) return;

    if (JSON.stringify(savedPurchase) !== JSON.stringify(purchase)) {
      setPurchaseSaved(false);
    }
  }, [purchase]);

  useEffect(() => {
    //temp maybe
    if (rows.length != 0 && rows != null && !receiveMode) {
      if (JSON.stringify(savedPurchase?.order_items) !== JSON.stringify(rows)) {
        setPurchaseSaved(false);
      }

      const tempPurchase = { ...purchase! }; // gotta find a nicer way around this lol..
      tempPurchase.order_items = rows;
      setPurchaseOrder(tempPurchase);
    }
  }, [rows]);

  const receiveColumns: GridColDef[] = [
    {
      field: "product_code",
      headerName: "Product Code",
      width: 150,
      editable: false,
    },
    {
      field: "product_name",
      headerName: "Product Name",
      width: 280,
      editable: false,
      renderCell: undefined,
    },
    {
      field: "purchased_amount",
      headerName: "Order Qty(KG)",
      type: "number",
      width: 110,
      align: "center",
      editable: false,
    },
    {
      field: "received_amount",
      headerName: "Received Qty",
      type: "number",
      width: 100,
      align: "center",
      editable: false,
    },
    {
      field: "remaining_amount",
      headerName: "Awaiting Qty",
      type: "number",
      width: 100,
      align: "center",
      editable: false,
      valueGetter: (params) =>
        params.row.purchased_amount - params.row.received_amount,
    },
    {
      field: "unit_price",
      headerName: "Cost($/KG)",
      type: "number",
      width: 100,
      align: "center",
      editable: false,
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
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 240,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleReceiveRow(params.row, false)}
          >
            Send to Qc
          </Button>

          <Button
            variant="outlined"
            color="warning"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => handleReceiveRow(params.row, true)}
          >
            Quarantine
          </Button>
        </strong>
      ),
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
            disabled={purchase!.status !== 6}
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
      field: "purchased_amount",
      headerName: "Order Qty(KG)",
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

  const handleReceiveRow = (row: IOrderItemProcess, quarantine: boolean) => {
    if (
      !row.container_size ||
      !row.expiry_date ||
      !row.lot_number ||
      !row.process_amount
    ) {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: { color: "warning", text: "Missing Fields in this Row" },
        })
      );
    } else {
      handlePurchaseItem(row, quarantine).then((_purchase) => {
        if (_purchase) {
          savedPurchase = _purchase;
          setPurchaseOrder(_purchase);
          setPurchaseSaved(true);
          const newRows = rows.map((r) => {
            if (r._id === row._id) {
              return {
                ...r,
                received_amount: r.received_amount + row.process_amount,
                lot_number: "",
                process_amount: null,
                container_size: null,
                expiry_date: null,
              };
            }
            return r;
          });
          setRows(newRows);
        } else {
          console.log("Purchase Not Updated");
        }
      });
    }
  };

  const handleConfirmPurchase = () => {
    confirmPurchase(purchase!, purchase!._id).then((_purchase) => {
      if (_purchase) {
        // window.location.reload();
        savedPurchase = _purchase;
        setPurchaseOrder(_purchase);
        setPurchaseSaved(true);
      } else {
        console.log("Purchase Not Updated");
      }
    });
  };

  const handleMarkPurchaseReceived = () => {
    markPurchaseReceived(purchase!._id).then((_purchase) => {
      if (_purchase) {
        // window.location.reload();
        savedPurchase = _purchase;
        setPurchaseOrder(_purchase);
        setPurchaseSaved(true);
      } else {
        console.log("Purchase Not Updated");
      }
    });
  };

  const handleMarkPurchaseCancelled = () => {
    markPurchaseCancelled(purchase!._id).then((_purchase) => {
      console.log("cancel purchase", _purchase, _purchase?.status);
      if (_purchase) {
        savedPurchase = _purchase;
        setPurchaseOrder(_purchase);
        setPurchaseSaved(true);
      } else {
        console.log("Purchase Not Updated");
      }
    });
  };

  const handleDeleteRow = (row_id: string) => {
    setRows([...rows.filter((m: IOrderItem) => m._id !== row_id)]);
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
        purchased_amount: 0,
        received_amount: 0,
        unit_price: 0,
      },
      ...rows.slice(0),
    ]);
    console.log(rows);
  };

  const savePurchase = async () => {
    //send new purchase to server
    if (id === "new") {
      const newPurchaseId = await createPurchase(purchase!);
      if (newPurchaseId) {
        navigate(`/purchase-orders/${newPurchaseId}`, { replace: true });
        setPurchaseOrder({ ...purchase!, _id: newPurchaseId });
      }
    } else {
      const updated = await updatePurchase(purchase!);

      if (updated === false) {
        throw Error("Update Purchase Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setPurchaseSaved(true);
  };
  const cancelSavePurchase = () => {
    setPurchaseOrder(savedPurchase);
    let tempPur = { ...savedPurchase! };
    setRows(tempPur.order_items);
    setPurchaseSaved(true);
  };

  if (purchase == null) return null;

  return (
    <>
      <SaveForm
        display={!purchaseSaved}
        onSave={savePurchase}
        onCancel={cancelSavePurchase}
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
              Purchase Orders
            </Button>
            <Grid sx={{ maxWidth: "85%" }} container spacing={3}>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setPurchaseOrder({
                      ...purchase,
                      order_code: e.target.value,
                    })
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Purchase Code"}
                  value={purchase.order_code}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setPurchaseOrder({
                      ...purchase,
                      date_purchased: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Purchase Date"}
                  type={"date"}
                  value={purchase.date_purchased}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setPurchaseOrder({
                      ...purchase,
                      date_arrived: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Arrival Date"}
                  type={"date"}
                  value={purchase.date_arrived}
                ></TextField>
              </Grid>
              <Grid item xs={2}>
                <Chip
                  label={
                    PurchaseStatus[
                      purchase?.status ? purchase?.status - 1 : 5
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
                    PurchaseStatus[
                      purchase?.status ? purchase?.status - 1 : 5
                    ][1]
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  onChange={(e) =>
                    setPurchaseOrder({
                      ...purchase,
                      shipping_code: e.target.value,
                    })
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Tracking Number"}
                  value={purchase.shipping_code}
                ></TextField>
              </Grid>

              <Grid item xs={3}>
                <StandaloneAutocomplete
                  initialValue={purchase.supplier}
                  onChange={(e, value) => {
                    setPurchaseOrder({ ...purchase, supplier: value });
                  }}
                  label={"Supplier"}
                  letterMin={0}
                  dbOption={"supplier"}
                  getOptionLabel={(item: ISupplier) => item.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  onChange={(e) =>
                    setPurchaseOrder({ ...purchase, notes: e.target.value })
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Notes"}
                  multiline
                  rows={6}
                  value={purchase.notes}
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
                display: `${purchase.status === 6 ? "box" : "none"}`,
              }}
              disabled={id === "new"}
              variant="contained"
              onClick={() => handleConfirmPurchase()}
            >
              Confirm
            </Button>

            <Button
              color="success"
              variant="contained"
              disabled={id === "new"}
              onClick={() => handleMarkPurchaseReceived()}
            >
              Set as Received
            </Button>
            <Button
              color="error"
              variant="outlined"
              disabled={id === "new"}
              onClick={() => handleMarkPurchaseCancelled()}
            >
              Cancel Order
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
              display: `${purchase.status === 6 ? "block" : "none"}`,
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
              (r: IOrderItem) => r._id === newRow._id
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
                received_amount: purchase.status != 6,
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
