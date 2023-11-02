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
import { AuthContext } from "../../components/navigation/AuthProvider";
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
} from "../../logic/purchase-order.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataGrid, GridCellParams, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import { IOrderItem } from "../../logic/purchase-order.logic";
import { IInventory } from "../../logic/inventory.logic";
import { ObjectID } from "bson";
import SaveForm from "../../components/forms/SaveForm";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import { ISupplier } from "../../logic/supplier.logic";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import { ILocation } from "../../logic/location.logic";

let savedPurchase: IPurchaseOrder | null = null;

const PurchaseStatus = [
  ["AWAITING SHIPPING", "warning"],
  ["AWAITING ARRIVAL", "warning"],
  ["PARTIALLY RECEIVED", "success"],
  ["RECEIVED", "success"],
  ["ABANDONED", "error"],
  ["DRAFT", "warning"],
];


const emptyPurchase: IPurchaseOrder = {
  _id: "",
  supplier: { _id: "", code: "" },
  date_purchased: new Date().toISOString().split('T')[0],
  date_arrived: "",
  shipping_code: "",
  status: 6,
  order_code: "",
  order_items: [],
  notes: "",
};

const inputRefMap = {
  order_code: 0,
  date_purchased: 1,
  supplier:2
  //TODO: Supplier
};

const inputMap: InputInfo[] = [
  { label: "order_code", ref: 0, validation: { required: true, genericVal: "Text" } },
  {
    label: "date_purchased",
    ref: 1,
    validation: { required: true, genericVal: "Date" },
  },
  {
    label: "supplier",
    ref: 2,
    validation: { required: true, genericVal: "Text" },
  },
];

export const PurchaseDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);
  const [purchaseSaved, setPurchaseSaved] = React.useState<boolean>(true);
  const [purchase, setPurchase] = React.useState<IPurchaseOrder | null>(
    null
  );
  const [rows, setRows] = React.useState<IOrderItem[]>([]);
  const [receiveMode, setReceiveMode] = React.useState<boolean>(false);

  const inputRefs = React.useRef<any[]>([]);
  const [inputVisuals, setInputVisuals] = React.useState<InputVisual[]>(
    Array(inputMap.length).fill({ helperText: "", error: false })
  );


  
  const onInputBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    input: InputInfo
  ) => {
    const _input = inputRefs.current[input.ref];

    const inputVal = isValid(_input.value, inputMap[input.ref].validation);
    inputVisuals[input.ref] = {
      helperText: inputVal.msg,
      error: !inputVal.valid,
    };

    setInputVisuals({ ...inputVisuals });

    const label = inputMap[input.ref].label;
    //@ts-ignore
    purchase[label] = event.target.value;

    setPurchase({ ...purchase! });
    setPurchaseSaved(false);
  };


  
  const savePurchase = async () => {
    let allValid = true;
    //do client side validation
    for (let i = 0; i < inputRefs.current.length; i++) {
      const _input = inputRefs.current[i];

      const inputVal = isValid(_input.value, inputMap[i].validation);
      inputVisuals[i] = {
        helperText: inputVal.msg,
        error: !inputVal.valid,
      };

      if (inputVal.valid === false) {
        allValid = false;
      }
    }

    setInputVisuals({ ...inputVisuals });

    if (allValid === false) {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: {
            text: "Changes Not Saved. Some inputs are invalid",
            color: "error",
          },
        })
      );
      return;
    }
    //send new purchase to server
    if (id === "new") {
      await createPurchase(purchase!).then((_purchase) => {
        if (_purchase) {
          navigate(`/purchase-orders/${_purchase._id}`, { replace: true });
          savedPurchase = _purchase;
          setPurchase(_purchase);
          setPurchaseSaved(true);
        } else {
          console.log("Purchase Not Saved");
        }
      })

    } else { //TODO: Ensure user can't save PO with empty rows
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
    setPurchase(savedPurchase);
    let tempPur = { ...savedPurchase! };
    setRows(tempPur.order_items);
    setPurchaseSaved(true);
  };

  const handleEditProductRow = (rowid: string, value: IInventory) => {
    let pList = rows!.slice();
    const rowIdx = rows!.findIndex((r: any) => r._id === rowid);
    pList[rowIdx].product_code = value.product_code;
    pList[rowIdx].product_id = value._id;
    pList[rowIdx].product_name = value.name;
    setRows(pList);
  };




  useEffect(() => {
    if (id === "new") {
      savedPurchase = emptyPurchase;
      setPurchase(emptyPurchase);
      setRows([]);
    } else {
      getPurchase(id!).then((p) => {
        const tempPurchase = { ...p! };
        savedPurchase = tempPurchase;
        setPurchase(p!);
        setRows(
          p!.order_items.map((item) => {
            item._id = item._id ? item._id : new ObjectID().toHexString(); // can remove this in future after migrations.
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
      setPurchase(tempPurchase);
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
      field: "sample",
      headerName: "Sample",
      type: "boolean",
      width: 80,
      editable: true,
      align: "center",
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
    // {
    //   field: "location",
    //   headerName: "Location",
    //   width: 140,
    //   sortable: false,
    //   filterable: false,
    //   renderCell: (row_params: GridRenderCellParams<string>) => (
    //     <TableAutocomplete
    //     initialValue={row_params.row.location}
    //       readOnly={purchase!.status === 6 || purchase!.status === 4}
    //       dbOption="location"
    //       handleEditRow={handleEditProductRow}
    //       rowParams={row_params}
    //       letterMin={0}
    //       getOptionLabel={(item: ILocation) => item ?
    //         `${item.code} | ${item.name}` : ''
    //       }
    //     />
    //   ),
    // },
    {
      field: "expiry_date", //TODO: Fix blur not putting value in so clicking button will say "missing fields :-(" (maybe make mini date choosing custom component)
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
        initialValue={row_params.row.product_name}
          readOnly={purchase!.status != 6}
          dbOption="raw-mat"
          handleEditRow={handleEditProductRow}
          rowParams={row_params}
          letterMin={3}
          getOptionLabel={(item: IInventory) => item.name ?
            `${item.product_code} | ${item.name}` : ''
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
      field: "sample",
      headerName: "Sample",
      type: "boolean",
      width: 80,
      editable: true,
      align: "center",
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
          setPurchase(_purchase);
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
        setPurchase(_purchase);
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
        setPurchase(_purchase);
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
        setPurchase(_purchase);
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
        sample:false
      },
      ...rows.slice(0),
    ]);
    console.log(rows);
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
                  defaultValue={purchase.order_code}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.order_code] = el)
                  }
                  error={inputVisuals[inputRefMap.order_code].error}
                  helperText={inputVisuals[inputRefMap.order_code].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.order_code])
                  }
                  required={inputMap[inputRefMap.order_code].validation.required}
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Purchase Code"}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  defaultValue={purchase.date_purchased}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.date_purchased] = el)
                  }
                  error={inputVisuals[inputRefMap.date_purchased].error}
                  helperText={inputVisuals[inputRefMap.date_purchased].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.date_purchased])
                  }
                  required={inputMap[inputRefMap.date_purchased].validation.required}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Purchase Date"}
                  type={"date"}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setPurchase({
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
                    maxHeight:40,
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
                    setPurchase({
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
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.supplier] = el)
                  }
                  error={inputVisuals[inputRefMap.supplier].error}
                  helperText={inputVisuals[inputRefMap.supplier].helperText}
                  onChange={(event, value) => {
                    console.log(value, 'testing ')
                    setPurchase({ ...purchase, supplier: {_id: value._id, code: value.code} });
                    // onInputBlur(event, inputMap[inputRefMap.material_type]);
                  }}
                  // onBlur={(event: any) =>
                  //   onInputBlur(event, inputMap[inputRefMap.supplier])
                  // }
                  required={
                    inputMap[inputRefMap.supplier].validation.required
                  }
                  label={"Supplier"}
                  letterMin={0}
                  readOnly={purchase.status != 6}
                  dbOption={"supplier"}
                  getOptionLabel={(item: ISupplier) => item ? item.code : ''}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  onChange={(e) =>
                    setPurchase({ ...purchase, notes: e.target.value })
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
          getCellClassName={(params: GridCellParams<number>) => {
            if (params.field === 'unit_price') {
              return params.row.unit_price > 0 ? '' : 'YellowRow';
            } else if (params.field === 'expiry_date') {
              return params.row.expiry_date != null ? '' : 'YellowRow';
            } else if (params.field === 'lot_number') {
              return params.row.lot_number != null ? '' : 'YellowRow';
            } else if (params.field === 'container_size') {
              return params.row.container_size > 0 ? '' : 'YellowRow';
            } else if (params.field === 'process_amount') {
              return params.row.process_amount > 0 ? '' : 'YellowRow';
            }
            return '';
          }}
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
