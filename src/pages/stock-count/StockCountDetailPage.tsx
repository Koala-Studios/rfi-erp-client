import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";

import Battery0BarTwoToneIcon from "@mui/icons-material/Battery0BarTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { ObjectID } from "bson";
import SaveForm from "../../components/forms/SaveForm";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import { IInventoryStock } from "../../logic/inventory-stock.logic";
import { IInventory } from "../../logic/inventory.logic";
import { ILocation } from "../../logic/location.logic";
import {
  ICountItem,
  IStockCount,
  abandonStockCount,
  approveStockCount,
  createStockCount,
  disapproveStockCount,
  fillAllLocation,
  fillAllStockCount,
  getStockCount,
  submitStockCount,
  updateStockCount,
} from "../../logic/stock-count.logic";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
let savedStockCount: IStockCount | null = null;

const StockCountStatus = [
  ["DRAFT", "warning"],
  ["SUBMITTED", "warning"],
  ["APPROVED", "success"],
  ["ABANDONED", "error"],
];

export const StockCountDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);

  const handleEditProductRow = (rowid: string, value: IInventory) => {
    console.log(rowid, value, "test");
    let pList = rows!.slice();
    const rowIdx = rows!.findIndex((r: any) => r.id === rowid);
    pList[rowIdx].product_code = value.product_code;
    pList[rowIdx].product_id = value._id;
    pList[rowIdx].name = value.name;
    setRows(pList);
  };

  const emptyStockCount: IStockCount = {
    _id: "",
    status: 1,
    created_date: new Date().toISOString().split("T")[0],
    approved_date: "",
    count_code: "",
    count_items: [],
    notes: "",
  };

  const [stockCountSaved, setStockCountSaved] = React.useState<boolean>(true);
  const [stockCount, setStockCount] = React.useState<IStockCount | null>(null);

  const inputRefMap = {
    count_code: 0,
    created_date: 1,
    approved_date: 2,
    notes: 3,
    //TODO: Supplier
  };

  const inputMap: InputInfo[] = [
    {
      label: "count_code",
      ref: 0,
      validation: { required: true, genericVal: "Text" },
    },
    {
      label: "created_date",
      ref: 1,
      validation: { required: true, genericVal: "Date" },
    },
    {
      label: "approved_date",
      ref: 2,
      validation: { required: false, genericVal: "Date" },
    },
    {
      label: "notes",
      ref: 3,
      validation: { required: false, genericVal: "Text" },
    },
  ];

  const [selectedContainer, setSelectedContainer] =
    React.useState<IInventoryStock | null>(null);
  const [selectedLocation, setSelectedLocation] =
    React.useState<ILocation | null>(null);
  const [weighedAmt, setWeighedAmt] = React.useState<number>(NaN);

  const [rows, setRows] = React.useState<ICountItem[]>([]);
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
    stockCount[label] = event.target.value;

    setStockCount({ ...stockCount! });
    setStockCountSaved(false);
  };

  useEffect(() => {
    if (id === "new") {
      savedStockCount = emptyStockCount;
      setStockCount(emptyStockCount);
      setRows([]);
    } else {
      getStockCount(id!).then((p) => {
        const tempStockCount = { ...p! };
        savedStockCount = tempStockCount;
        setStockCount(p!);
        console.log(p);
        setRows(
          p!.count_items.map((item: ICountItem) => {
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
    if (stockCount === null) return;
    setReceiveMode(stockCount.status <= 3);

    if (stockCountSaved === false) return;

    if (JSON.stringify(savedStockCount) !== JSON.stringify(stockCount)) {
      setStockCountSaved(false);
    }
  }, [stockCount]);

  useEffect(() => {
    //temp maybe
    if (rows.length !== 0 && rows !== null) {
      if (
        JSON.stringify(savedStockCount?.count_items) !== JSON.stringify(rows)
      ) {
        setStockCountSaved(false);
      }

      const tempStockCount = { ...stockCount! }; // gotta find a nicer way around this lol..
      tempStockCount.count_items = rows;
      setStockCount(tempStockCount);
    }
  }, [rows]);

  const receiveColumns: GridColDef[] = [
    {
      field: "_id",
      headerName: "Actions",
      align: "left",
      width: 80,
      renderCell: (params: GridRenderCellParams<string>) => (
        <div>
          <IconButton
            disabled={stockCount!.status !== 1}
            onClick={() => handleDeleteRow(params.row._id)}
            aria-label="delete"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
    {
      field: "product_code",
      headerName: "Product Code",
      width: 150,
      editable: false,
    },
    {
      field: "name",
      headerName: "Product Name",
      width: 280,
      editable: false,
      renderCell: undefined,
    },
    {
      field: "lot_number",
      headerName: "Lot#",
      type: "string",
      width: 130,
      editable: false,
      align: "right",
    },
    {
      field: "expiry_date",
      headerName: "Exp Date",
      type: "date",
      width: 120,
      editable: false,
      align: "right",
      valueGetter: (params) =>
        params.row.expiry_date ? params.row.expiry_date.split("T")[0] : "",
    },
    {
      field: "container_size",
      headerName: "Qty/Cont",
      type: "number",
      width: 120,
      align: "center",
      editable: false,
    },
    {
      field: "container_amount",
      headerName: "Cont Qty",
      type: "number",
      width: 120,
      align: "center",
      editable: false,
    },
    {
      field: "current_amount",
      headerName: "Curr Qty",
      type: "number",
      width: 120,
      align: "center",
      editable: false,
    },
    {
      field: "proposed_amount",
      headerName: "Weighed Qty",
      type: "number",
      width: 120,
      editable: stockCount ? stockCount!.status === 1 : true,
      align: "center",
    },
  ];

  const handleSubmitStockCount = () => {
    if (stockCount?.count_items.length === 0) {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: {
            text: "No rows in stock count.",
            color: "error",
          },
        })
      );
      return;
    }
    submitStockCount(stockCount!).then((_stockCount) => {
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

  const handleApproveStockCount = () => {
    approveStockCount(stockCount!).then((_stockCount) => {
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

  const handleDisapproveStockCount = () => {
    disapproveStockCount(stockCount!).then((_stockCount) => {
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

  const handleAbandonStockCount = () => {
    abandonStockCount(stockCount!).then((_stockCount) => {
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
      ...rows.slice(rowIndex === rows.length ? rowIndex : rowIndex + 1),
    ]);
    console.log(rows, "pizzeria mama mia");
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
  //     ...rows.slice(index === rows.length - 1 ? index + 2 : index + 1),
  //   ]);
  // };

  const handleAddRow = () => {
    if (selectedContainer && !Number.isNaN(weighedAmt)) {
      if (
        rows.findIndex((e) => e.container_id === selectedContainer._id) !== -1
      ) {
        console.log(
          rows.findIndex((e) => e.container_id === selectedContainer._id),
          rows,
          selectedContainer,
          "BRUH."
        );
        window.dispatchEvent(
          new CustomEvent("NotificationEvent", {
            detail: {
              text: "Container already in rows",
              color: "error",
            },
          })
        );
        setSelectedContainer(null);
        setWeighedAmt(NaN);
        return;
      }
      setRows([
        {
          _id: new ObjectID().toHexString(),
          //@ts-ignore //TODO: remove this clearly.
          product_id: selectedContainer.product_id,
          product_code: selectedContainer.product_code,
          name: selectedContainer.name,
          expiry_date: selectedContainer.expiry_date,
          lot_number: selectedContainer.lot_number,
          container_id: selectedContainer._id,
          container_size: selectedContainer.container_size,
          container_amount: Math.ceil(
            selectedContainer.remaining_amount /
              selectedContainer.container_size
          ),
          current_amount: selectedContainer.remaining_amount,
          proposed_amount: weighedAmt,
        },
        ...rows.slice(0),
      ]);
      setSelectedContainer(null);
      setWeighedAmt(NaN);
    } else {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: {
            text: "No Container Selected Or Amount is Empty",
            color: "error",
          },
        })
      );
    }
  };
  const handlefillAllStockCount = () => {
    fillAllStockCount().then((containers) => {
      containers?.map((container: IInventoryStock) => {
        setRows([
          {
            _id: new ObjectID().toHexString(),
            //@ts-ignore //TODO: remove this clearly.
            product_id: container.product_id,
            product_code: container.product_code,
            name: container.name,
            expiry_date: container.expiry_date,
            lot_number: container.lot_number,
            container_id: container._id,
            container_size: container.container_size ?? 0,
            container_amount:
              container.remaining_amount && container.container_size
                ? Math.ceil(
                    container.remaining_amount / container.container_size
                  )
                : 0,
            current_amount: container.remaining_amount ?? 0,
            proposed_amount: 0,
          },
          ...rows.slice(0),
        ]);
      });
    });
  };
  const handlefillLocation = () => {
    if (selectedLocation) {
      console.log(selectedLocation);
      fillAllLocation(selectedLocation!._id).then((containers) => {
        containers?.map((container: IInventoryStock) => {
          setRows([
            {
              _id: new ObjectID().toHexString(),
              //@ts-ignore //TODO: remove this clearly.
              product_id: container.product_id,
              product_code: container.product_code,
              name: container.name,
              expiry_date: container.expiry_date,
              lot_number: container.lot_number,
              container_id: container._id,
              container_size: container.container_size ?? 0,
              container_amount:
                container.remaining_amount && container.container_size
                  ? Math.ceil(
                      container.remaining_amount / container.container_size
                    )
                  : 0,
              current_amount: container.remaining_amount ?? 0,
              proposed_amount: 0,
            },
            ...rows.slice(0),
          ]);
        });
      });
    }
  };

  const saveStockCount = async () => {
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
    //send new stockCount to server
    if (id === "new") {
      const _stockCount = await createStockCount(stockCount!);
      console.log(_stockCount);
      if (_stockCount) {
        navigate(`/stock-counts/${_stockCount._id}`, { replace: true });
        setStockCount({ ..._stockCount });
        savedStockCount = _stockCount;
        setStockCountSaved(true);
      } else {
      }
    } else {
      const updated = await updateStockCount(stockCount!);

      if (updated === false) {
        throw Error("Update Stock Count Error");
      }
    }
    setStockCountSaved(true);
  };
  const cancelSaveStockCount = () => {
    setStockCount(savedStockCount);
    let tempPur = { ...savedStockCount! };
    setRows(tempPur.count_items);
    setStockCountSaved(true);
  };

  if (stockCount === null) return null;

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
                  defaultValue={stockCount.count_code}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.count_code] = el)
                  }
                  error={inputVisuals[inputRefMap.count_code].error}
                  helperText={inputVisuals[inputRefMap.count_code].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.count_code])
                  }
                  required={
                    inputMap[inputRefMap.count_code].validation.required
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Stock Count Code"}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  defaultValue={stockCount.created_date.split("T")[0]}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.created_date] = el)
                  }
                  error={inputVisuals[inputRefMap.created_date].error}
                  helperText={inputVisuals[inputRefMap.created_date].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.created_date])
                  }
                  required={
                    inputMap[inputRefMap.created_date].validation.required
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Created Date"}
                  type={"date"}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  defaultValue={
                    stockCount.approved_date
                      ? stockCount.approved_date.split("T")[0]
                      : null
                  }
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.approved_date] = el)
                  }
                  error={inputVisuals[inputRefMap.approved_date].error}
                  helperText={
                    inputVisuals[inputRefMap.approved_date].helperText
                  }
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.approved_date])
                  }
                  required={
                    inputMap[inputRefMap.approved_date].validation.required
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Approved Date"}
                  type={"date"}
                ></TextField>
              </Grid>
              <Grid item xs={2}>
                <Chip
                  label={
                    StockCountStatus[
                      stockCount?.status ? stockCount?.status - 1 : 3
                    ][0]
                  }
                  sx={{
                    width: "100%",
                    height: "100%",
                    maxHeight: 40,
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                  //@ts-ignore
                  color={
                    StockCountStatus[
                      stockCount?.status ? stockCount?.status - 1 : 3
                    ][1]
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  defaultValue={stockCount.notes}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.notes] = el)
                  }
                  error={inputVisuals[inputRefMap.notes].error}
                  helperText={inputVisuals[inputRefMap.notes].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.notes])
                  }
                  required={inputMap[inputRefMap.notes].validation.required}
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Notes"}
                  multiline
                  rows={6}
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
              disabled={id === "new" || stockCount!.status !== 1}
              variant="contained"
              onClick={() => handleSubmitStockCount()}
            >
              Submit For Approval
            </Button>

            <Button
              color="success"
              variant="contained"
              disabled={id === "new" || stockCount!.status !== 2}
              onClick={() => handleApproveStockCount()}
            >
              Approve
            </Button>
            <Button
              color="warning"
              variant="contained"
              disabled={id === "new" || stockCount!.status !== 2}
              onClick={() => handleDisapproveStockCount()}
            >
              Disapprove
            </Button>
            <Button
              color="error"
              variant="outlined"
              disabled={
                id === "new" ||
                stockCount!.status === 4 ||
                stockCount!.status === 3
              }
              onClick={() => handleAbandonStockCount()}
            >
              Abandon
            </Button>
          </Card>
        </div>
      </Card>
      <Card variant="outlined" sx={{ mt: 2, padding: 2, overflowY: "auto" }}>
        {/* <div style={{ display: "flex", flexDirection: "row", gap: 10 }}> */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={3}>
            <StandaloneAutocomplete
              initialValue={selectedLocation}
              readOnly={stockCount.status !== 1}
              onChange={(e, value) => {
                setSelectedLocation(value);
              }}
              label={"Location Lookup"}
              letterMin={0}
              dbOption={"location"}
              getOptionLabel={(item: ILocation) => {
                return (
                  item.code +
                  " | " +
                  item.name +
                  " | Containers: " +
                  item.total_containers
                );
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" onClick={() => handlefillLocation()}>
              Import Location
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Button
              color="info"
              variant="contained"
              onClick={() => handlefillAllStockCount()}
            >
              Import All
            </Button>
          </Grid>
          <Grid item xs={5} />
          <Grid item xs={4.5}>
            <StandaloneAutocomplete
              initialValue={selectedContainer}
              readOnly={stockCount.status !== 1}
              onChange={(e, value) => {
                setSelectedContainer(value);
                console.log(value);
              }}
              // groupBy={(option:IInventoryStock) => option.product_code + ' | ' + option.name}
              label={"Container Lookup"}
              letterMin={0}
              dbOption={"inventory-stock"}
              getOptionLabel={(item: IInventoryStock) => {
                return (
                  item.product_code +
                  " | " +
                  item.name +
                  " | LOT#: " +
                  item.lot_number +
                  " | CONT SIZE: " +
                  item.container_size
                  // +
                  // " | CONT AMT: " +
                  // Math.floor(item.received_amount / item.container_size) +
                  // " | CURR AMT: " +
                  // (item.received_amount - item.used_amount)
                );
              }}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              disabled={stockCount.status !== 1}
              spellCheck="false"
              InputLabelProps={{ shrink: true }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">KG</InputAdornment>
                ),
                readOnly: true,
              }}
              variant="outlined"
              label={"Total in Inv"}
              //@ts-ignore
              // value={selectedContainer ? (selectedContainer?.product_id.stock.on_hand).toFixed(4) : 0}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              disabled={stockCount.status !== 1}
              spellCheck="false"
              InputLabelProps={{ shrink: true }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">KG</InputAdornment>
                ),
                readOnly: true,
              }}
              variant="outlined"
              label={"Cont Size"}
              value={selectedContainer ? selectedContainer?.container_size : 0}
            />
          </Grid>
          <Grid item xs={1}>
            <TextField
              disabled={stockCount.status !== 1}
              spellCheck="false"
              InputLabelProps={{ shrink: true }}
              size="small"
              InputProps={{
                endAdornment: <Battery0BarTwoToneIcon />,
                readOnly: true,
              }}
              variant="outlined"
              label={"Cont Qty"}
              value={
                selectedContainer
                  ? Math.ceil(
                      selectedContainer?.remaining_amount /
                        selectedContainer?.container_size
                    )
                  : 0
              }
            />
          </Grid>
          <Grid item xs={1.5}>
            <TextField
              disabled={stockCount.status !== 1}
              spellCheck="false"
              InputLabelProps={{ shrink: true }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">KG</InputAdornment>
                ),
                readOnly: true,
              }}
              variant="outlined"
              // type="number"

              label={"Curr Amt"}
              value={
                selectedContainer
                  ? (selectedContainer?.remaining_amount).toFixed(4)
                  : 0
              }
            />
          </Grid>
          <Grid item xs={1.5}>
            <TextField
              onChange={(e) => setWeighedAmt(parseFloat(e.target.value))}
              disabled={stockCount.status !== 1}
              spellCheck="false"
              InputLabelProps={{ shrink: true }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">KG</InputAdornment>
                ),
              }}
              variant="outlined"
              type="number"
              label={"Weighed amount"}
              value={weighedAmt}
            />
          </Grid>
          <Grid item xs={1}>
            <Button
              disabled={stockCount.status !== 1}
              variant="contained"
              onClick={() => {
                handleAddRow();
              }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
        {/* </div> */}
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
            if (event.code === "Space") {
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
          columns={receiveColumns}
          onCellEditCommit={(e, value) => {
            handleEditCell(e.id.toString(), e.field, e.value);
            console.log("test", rows);
          }}
        ></DataGrid>
      </Card>
    </>
  );
};
