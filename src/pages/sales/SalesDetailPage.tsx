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
  confirmSales,
  createSales,
  getSalesOrder,
  handleSalesItem,
  IOrderItemProcess,
  ISalesOrder,
  markSalesCancelled,
  markSalesReceived,
  updateSales,
} from "../../logic/sales-order.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import { IOrderItem } from "../../logic/sales-order.logic";
import { IInventory } from "../../logic/inventory.logic";
import { ObjectID } from "bson";
import SaveForm from "../../components/forms/SaveForm";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import { ICustomer } from "../../logic/customer.logic";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import { ILocation } from "../../logic/location.logic";
import { ICustomerProduct } from "../../logic/customer-product.logic";

let savedSales: ISalesOrder | null = null;

const SalesStatus = [
  ["AWAITING PRODUCTION", "warning"],
  ["AWAITING SHIPPING", "warning"],
  ["PARTIALLY FINISHED", "success"],
  ["FINISHED", "success"],
  ["ABANDONED", "error"],
  ["DRAFT", "warning"],
];

const ItemStatus = [
  ["PENDING", "error"],
  ["SCHEDULED", "warning"],
  ["IN PRODUCTION", "warning"],
  ["QC", "info"],
  ["WAITING SHIPPING", "info"],
  ["FULFILLED", "success"],
];

const emptySales: ISalesOrder = {
  _id: "",
  customer: { _id: "", code: "", name: "" },
  date_sold: new Date().toISOString().split("T")[0],
  date_shipped: "",
  shipping_code: "",
  status: 6,
  order_code: "",
  order_items: [],
  notes: "",
};

const inputRefMap = {
  order_code: 0,
  date_sold: 1,
  customer: 2,
  //TODO: Customer
};

const inputMap: InputInfo[] = [
  {
    label: "order_code",
    ref: 0,
    validation: { required: true, genericVal: "Text" },
  },
  {
    label: "date_sold",
    ref: 1,
    validation: { required: true, genericVal: "Date" },
  },
  {
    label: "customer",
    ref: 2,
    validation: { required: true, genericVal: "Text" },
  },
];

export const SalesDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);
  const [salesSaved, setSalesSaved] = React.useState<boolean>(true);
  const [sales, setSales] = React.useState<ISalesOrder | null>(null);
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
    sales[label] = event.target.value;

    setSales({ ...sales! });
    setSalesSaved(false);
  };

  const saveSales = async () => {
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
    //send new sales to server
    if (id === "new") {
      await createSales(sales!).then((_sales: ISalesOrder | null) => {
        if (_sales) {
          navigate(`/sales-orders/${_sales._id}`, { replace: true });
          savedSales = _sales;
          setSales(_sales);
          setSalesSaved(true);
        } else {
          console.log("Sales Not Saved");
        }
      });
    } else {
      //TODO: Ensure user can't save sales with empty rows
      const updated = await updateSales(sales!);

      if (updated === false) {
        throw Error("Update Sales Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setSalesSaved(true);
  };
  const cancelSaveSales = () => {
    setSales(savedSales);
    let tempPur = { ...savedSales! };
    setRows(tempPur.order_items);
    setSalesSaved(true);
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
      savedSales = emptySales;
      setSales(emptySales);
      setRows([]);
    } else {
      getSalesOrder(id!).then((p: any) => {
        const tempSales = { ...p! };
        savedSales = tempSales;
        setSales(p!);
        setRows(
          p!.order_items.map((item: any) => {
            item._id = item._id ? item._id : new ObjectID().toHexString(); // can remove this in future after migrations.
            return item;
          })
        );
        setReceiveMode(p!.status <= 3);
        // setSalesSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (sales == null) return;
    setReceiveMode(sales.status <= 3);

    if (salesSaved === false) return;

    if (JSON.stringify(savedSales) !== JSON.stringify(sales)) {
      setSalesSaved(false);
    }
  }, [sales]);

  useEffect(() => {
    //temp maybe
    if (rows.length != 0 && rows != null && !receiveMode) {
      if (JSON.stringify(savedSales?.order_items) !== JSON.stringify(rows)) {
        setSalesSaved(false);
      }

      const tempSales = { ...sales! }; // gotta find a nicer way around this lol..
      tempSales.order_items = rows;
      setSales(tempSales);
    }
  }, [rows]);

  const receiveColumns: GridColDef[] = [
    {
      field: "product_code",
      headerName: "Product Code",
      width: 120,
      editable: false,
    },
    {
      field: "customer_sku",
      headerName: "Customer Sku",
      width: 120,
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
      field: "sold_amount",
      headerName: "Order Qty(KG)",
      type: "number",
      width: 110,
      align: "center",
      editable: false,
    },
    // {
    //   field: "received_amount",
    //   headerName: "Received Qty",
    //   type: "number",
    //   width: 100,
    //   align: "center",
    //   editable: false,
    // },
    // {
    //   field: "remaining_amount",
    //   headerName: "Awaiting Qty",
    //   type: "number",
    //   width: 100,
    //   align: "center",
    //   editable: false,
    //   valueGetter: (params) =>
    //     params.row.salesd_amount - params.row.received_amount,
    // },
    {
      field: "unit_price",
      headerName: "Price($/KG)",
      type: "number",
      width: 100,
      align: "center",
      editable: false,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      align: "center",
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
      field: "container_size",
      headerName: "Cont Size(KG)",
      type: "number",
      width: 120,
      editable: true,
      align: "center",
    },
    {
      field: "date_needed", //TODO: Fix blur not putting value in so clicking button will say "missing fields :-(" (maybe make mini date choosing custom component)
      headerName: "Needed Date",
      type: "date",
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
    //       readOnly={sales!.status === 6 || sales!.status === 4}
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
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 250,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          {params.row.batch_id === "" && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleRow(params.row)}
            >
              Schedule Batching
            </Button>
          )}
          {params.row.batch_id != "" && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => navigate("/batching/" + params.row.batch_id)}
            >
              See Batching
            </Button>
          )}
          {/* <Button
            variant="outlined"
            color="warning"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => handleReceiveRow(params.row, true)}
          >
            
          </Button> */}
        </strong>
      ),
    },
    {
      field: "sample",
      headerName: "Sample",
      type: "boolean",
      width: 80,
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
            disabled={sales!.status !== 6}
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
          readOnly={sales!.status != 6}
          dbOption="customer-product"
          searchOptionalVar={sales!.customer._id}
          handleEditRow={handleEditProductRow}
          rowParams={row_params}
          letterMin={0}
          getOptionLabel={(item: ICustomerProduct) =>
            item.c_prod_name ? `${item.customer_sku} | ${item.c_prod_name}` : ""
          }
        />
      ),
    },
    {
      field: "sold_amount",
      headerName: "Order Qty(KG)",
      type: "number",
      width: 110,
      align: "center",
      editable: true,
    },
    {
      field: "unit_price",
      headerName: "Price($/KG)",
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

  const handleRow = (row: IOrderItemProcess) => {
    if (!row.process_amount) {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: { color: "warning", text: "Missing Fields in this Row" },
        })
      );
    } else {
      handleSalesItem(row, sales!._id).then((_sales) => {
        if (_sales) {
          savedSales = _sales;
          setSales(_sales);
          setRows(_sales.order_items);
          setSalesSaved(true);
        } else {
          console.log("Sales Not Updated");
        }
      });
    }
  };

  const handleConfirmSales = () => {
    confirmSales(sales!, sales!._id).then((_sales) => {
      if (_sales) {
        // window.location.reload();
        savedSales = _sales;
        setSales(_sales);
        setSalesSaved(true);
      } else {
        console.log("Sales Not Updated");
      }
    });
  };

  const handleMarkSalesReceived = () => {
    markSalesReceived(sales!._id).then((_sales) => {
      if (_sales) {
        // window.location.reload();
        savedSales = _sales;
        setSales(_sales);
        setSalesSaved(true);
      } else {
        console.log("Sales Not Updated");
      }
    });
  };

  const handleMarkSalesCancelled = () => {
    markSalesCancelled(sales!._id).then((_sales) => {
      console.log("cancel sales", _sales, _sales?.status);
      if (_sales) {
        savedSales = _sales;
        setSales(_sales);
        setSalesSaved(true);
      } else {
        console.log("Sales Not Updated");
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
        sold_amount: 0,
        shipped_amount: 0,
        unit_price: 0,
        batch_id: "",
        sample: false,
        status: 1,
      },
      ...rows.slice(0),
    ]);
    console.log(rows);
  };

  if (sales == null) return null;

  return (
    <>
      <SaveForm
        display={!salesSaved}
        onSave={saveSales}
        onCancel={cancelSaveSales}
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
              Sales Orders
            </Button>
            <Grid sx={{ maxWidth: "85%" }} container spacing={3}>
              <Grid item xs={3}>
                <TextField
                  defaultValue={sales.order_code}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.order_code] = el)
                  }
                  error={inputVisuals[inputRefMap.order_code].error}
                  helperText={inputVisuals[inputRefMap.order_code].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.order_code])
                  }
                  required={
                    inputMap[inputRefMap.order_code].validation.required
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Sale Code"}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  defaultValue={
                    sales.date_sold ? sales.date_sold.split("T")[0] : ""
                  }
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.date_sold] = el)
                  }
                  error={inputVisuals[inputRefMap.date_sold].error}
                  helperText={inputVisuals[inputRefMap.date_sold].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.date_sold])
                  }
                  required={inputMap[inputRefMap.date_sold].validation.required}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Order Date"}
                  type={"date"}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setSales({
                      ...sales,
                      date_shipped: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Fulfillment Date"}
                  type={"date"}
                  value={sales.date_shipped}
                ></TextField>
              </Grid>
              <Grid item xs={2}>
                <Chip
                  label={SalesStatus[sales?.status ? sales?.status - 1 : 5][0]}
                  sx={{
                    width: "100%",
                    height: "100%",
                    maxHeight: 40,
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                  //@ts-ignore
                  color={SalesStatus[sales?.status ? sales?.status - 1 : 5][1]}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  onChange={(e) =>
                    setSales({
                      ...sales,
                      shipping_code: e.target.value,
                    })
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Tracking Number"}
                  value={sales.shipping_code}
                ></TextField>
              </Grid>

              <Grid item xs={3}>
                <StandaloneAutocomplete
                  initialValue={sales.customer}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.customer] = el)
                  }
                  error={inputVisuals[inputRefMap.customer].error}
                  helperText={inputVisuals[inputRefMap.customer].helperText}
                  onChange={(event, value) => {
                    console.log(value, "testing ");
                    setSales({
                      ...sales,
                      customer: {
                        _id: value._id,
                        code: value.code,
                        name: value.name,
                      },
                    });
                    // onInputBlur(event, inputMap[inputRefMap.material_type]);
                  }}
                  // onBlur={(event: any) =>
                  //   onInputBlur(event, inputMap[inputRefMap.customer])
                  // }
                  required={inputMap[inputRefMap.customer].validation.required}
                  label={"Customer"}
                  letterMin={0}
                  readOnly={sales.status != 6}
                  dbOption={"customer"}
                  getOptionLabel={(item: ICustomer) =>
                    item.code ? `${item.code}` + " | " + `${item.name}` : ""
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  onChange={(e) =>
                    setSales({ ...sales, notes: e.target.value })
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Notes"}
                  multiline
                  rows={6}
                  value={sales.notes}
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
                display: `${sales.status === 6 ? "box" : "none"}`,
              }}
              disabled={id === "new"}
              variant="contained"
              onClick={() => handleConfirmSales()}
            >
              Confirm
            </Button>

            <Button
              color="success"
              variant="contained"
              disabled={id === "new"}
              onClick={() => handleMarkSalesReceived()}
            >
              Set as Fulfilled
            </Button>
            <Button
              color="error"
              variant="outlined"
              disabled={id === "new"}
              onClick={() => handleMarkSalesCancelled()}
            >
              Cancel Order
            </Button>
          </Card>
        </div>
      </Card>
      {sales.customer._id && (
        <Card variant="outlined" sx={{ mt: 2, padding: 2, overflowY: "auto" }}>
          <div>
            <Button
              style={{
                marginBottom: 10,
                marginRight: 10,
                display: `${sales.status === 6 ? "block" : "none"}`,
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
              return "";
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
                  received_amount: sales.status != 6,
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
      )}
    </>
  );
};
