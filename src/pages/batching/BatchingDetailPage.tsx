import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import { IInventory } from "../../logic/inventory.logic";
import { ObjectID } from "bson";
import SaveForm from "../../components/forms/SaveForm";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import { ISupplier } from "../../logic/supplier.logic";
import { confirmBatching, createBatching, getBatching, IBatching, markBatchingCancelled, updateBatching, finishBatching, IBatchingIngredient, generateBatchingBOM, batchingStatus, IBatchingContainer } from "../../logic/batching.logic";
import { IProduct } from "../../logic/product.logic";
import { padding } from "@mui/system";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import { BatchingDataTable } from "./BatchingDataTable";

let savedBatching: IBatching | null = null;

interface expBatchIngr extends IBatchingIngredient {
  _id: string;
  container_id: string;
  lot_number: string;
  amount_to_use: number;
  used_amount: number;
  sub_rows: IBatchingContainer[];
  has_enough: boolean
}

const BatchingStatus = [
  ["DRAFT", "warning"],
  ["SCHEDULED", "warning"],
  ["IN PROGRESS", "warning"],
  ["FINISHED", "success"],
  ["ABANDONED", "error"],
  ["CANCELLED", "error"],
];


const addDays = (date: Date, days: number) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


const emptyBatching: IBatching = {
  _id: "",
  status: 6,
  batch_code: "",
  ingredients: [],
  notes: "",
  product_code: "",
  name: "",
  product_id: "",
  quantity: NaN,
  date_created: new Date().toISOString().split('T')[0],
  date_needed: addDays(new Date(), 5).toISOString().split('T')[0]
};
const inputRefMap = {
  batch_code: 0,
  quantity: 1,
  notes: 2,
  product_id: 3,
};

const inputMap: InputInfo[] = [
  { label: "batch_code", ref: 0, validation: { required: true, genericVal: "Text" } },
  {
    label: "quantity",
    ref: 1,
    validation: { required: true, genericVal: "Text" },
  },
  {
    label: "notes",
    ref: 2,
    validation: { required: true, genericVal: "Text" },
  },

  { label: "product_id", ref: 3, validation: { required: true, genericVal: "Text" } },
  
];

export const BatchingDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);
  const inputRefs = React.useRef<any[]>([]);
  const [inputVisuals, setInputVisuals] = React.useState<InputVisual[]>(
    Array(inputMap.length).fill({ helperText: "", error: false })
  );

  const onInputBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    input: InputInfo
  ) => {
    const _input = inputRefs.current[input.ref];

    // console.log(_input, _input.value)
    const inputVal = isValid(_input.value, inputMap[input.ref].validation);
    inputVisuals[input.ref] = {
      helperText: inputVal.msg,
      error: !inputVal.valid,
    };

    setInputVisuals({ ...inputVisuals });

    const label = inputMap[input.ref].label;
    //@ts-ignore
    batching[label] = event.target.value;

    setBatching({ ...batching! });
    setBatchingSaved(false);
  };

  const handleEditProductRow = (rowid: string, value: IInventory) => {
    let pList = rows!.slice();
    const rowIdx = rows!.findIndex((r: any) => r._id === rowid);
    pList[rowIdx].product_code = value.product_code;
    pList[rowIdx].product_id = value._id;
    pList[rowIdx].product_name = value.name;
    setRows(pList);
  };


  const [batchingSaved, setBatchingSaved] = React.useState<boolean>(true);
  const [batching, setBatching] = React.useState<IBatching | null>(
    null
  );

  const [rows, setRows] = React.useState<IBatchingIngredient[]>([]);
  const [expandableRows, setExpandableRows] = React.useState<expBatchIngr[]>([]);
  const [receiveMode, setReceiveMode] = React.useState<boolean>(false);

  useEffect(() => {
    if (id === "new") {
      savedBatching = emptyBatching;
      setBatching(emptyBatching);
      setRows([]);
    } else {
      getBatching(auth.token, id!).then((p) => {
        const tempBatching = { ...p! };
        savedBatching = tempBatching;
        setBatching(p!);
        // newRows = batching!.ingredients.map((item) => { //!check soon for further changes
        //   return {
        //     _id: item._id ? item._id : new ObjectID().toHexString(),
        //     product_code: item.product_code,
        //     product_name: item.product_name,
        //     unit_price: item.unit_price,
        //     batchingd_amount: item.batchingd_amount,
        //     received_amount: item.received_amount,
        //     lot_number: '',
        //     container_size: null,
        //     process_amount: null,
        //     expiry_date:'',
        //     notes:'',
        //     remaining_amount: item.batchingd_amount - item.received_amount,
        //   };
        // });
        setRows(
          p!.ingredients.map((item: IBatchingIngredient) => {
            item._id = item._id ? item._id : new ObjectID().toHexString();

            return item;
          })
        );
        setExpandableRows(
          p!.ingredients.map((item) => {
            return {
              ...item,
              _id: item._id ? item._id : new ObjectID().toHexString(),
              container_id: item.used_containers.length > 0 ? item.used_containers[0].container_id : '',
              lot_number: item.used_containers.length > 0 ? item.used_containers[0].lot_number : '',
              amount_to_use: item.used_containers.length > 0 ? item.used_containers[0].amount_to_use : 0,
              used_amount: 0,
              sub_rows: item.used_containers.length > 1 ? item.used_containers.slice(1, undefined) : [],
              has_enough: true
            }
          })
        );
        setReceiveMode(p!.status <= 3);
        // setBatchingSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (batching == null) return;
    setReceiveMode(batching.status <= 3);

    if (batchingSaved === false) return;

    if (JSON.stringify(savedBatching) !== JSON.stringify(batching)) {
      setBatchingSaved(false);
    }
  }, [batching]);

  useEffect(() => {
    //temp maybe
    if (rows.length != 0 && rows != null && !receiveMode) {
      if (JSON.stringify(savedBatching?.ingredients) !== JSON.stringify(rows)) {
        setBatchingSaved(false);
      }

      const tempBatching = { ...batching! }; // gotta find a nicer way around this lol..
      tempBatching.ingredients = rows;
      setBatching(tempBatching);
    }
  }, [rows]);

  const expandableColumns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 125 },
    {
      field: "product_name",
      headerName: "Product Name",
      // width: 350,
      sortable: false,
      filterable: false,
      renderCell: (row_params: GridRenderCellParams<string>) => (
        <TableAutocomplete
          dbOption="material"
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
      field: "required_amount",
      headerName: "Required Qty",
      type: "number",
      width: 160,
      align: "right",
      editable: false,
    },
    {
      field: "remaining_amount",
      headerName: "Remaining Qty",
      type: "number",
      width: 160,
      align: "right",
      editable: true,
    },

    {
      field: "used_amount",
      headerName: "Total Used Qty",
      type: "number",
      width: 160,
      align: "right",
      editable: true,
    },
    {
      field: "lot_number",
      headerName: "Lot #",
      width: 150,
      align: "right",
      editable: true,
    },
    {
      field: "confirm_lot_number",
      headerName: "Confirm Lot #",
      width: 150,
      align: "right",
      editable: true,
    },
    {
      field: "amount_to_use",
      headerName: "Qty To Use",
      type: "number",
      width: 130,
      align: "right",
      editable: true,
    },
    {
      field: "amount_used",
      headerName: "Qty Used",
      type: "number",
      width: 130,
      align: "right",
      editable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "boolean",
      width: 50,
      align: "right",
      editable: false,
    },
    
  ];
  const sub_columns: GridColDef[] = [
    {
      field: "lot_number",
      headerName: "Lot Number",
      width: 155,
      align: "left",
      editable: true,
    },
    {
      field: "confirm_lot_number",
      headerName: "Lot Number",
      width: 150,
      align: "left",
      editable: true,
    },
    {
      field: "amount_to_use",
      headerName: "Qty To Use",
      type: "number",
      width: 140,
      align: "left",
      editable: true,
    },
    {
      field: "amount_used",
      headerName: "Qty Used",
      type: "number",
      width: 140,
      align: "left",
      editable: true,
    },
    {
      field: "id",
      headerName: "Actions",
      align:'left',
      width: 50,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="outlined"
            color="error"
            size="small"
            style={{
              backgroundColor: "#ff221115",
              fontSize: "25px",
              maxWidth: "40px",
              maxHeight: "30px",
              minWidth: "40px",
              minHeight: "30px",
              marginRight: "12px",
            }}
            onClick={() => handleDeleteRow(params.row._id)}
          >
            -
          </Button>
        </strong>
      ),
    },
  ];

  const handleConfirmBatching = () => {
    confirmBatching(auth.token, batching!).then((_batching: IBatching | null) => {
      if (_batching) {
        savedBatching = _batching;
        setBatching(_batching);
        setBatchingSaved(true);
        handleGenerateBatchingBOM();
      } else {
        console.log("Batching Not Updated");
      }
    });
  };

  const handleGenerateBatchingBOM = () => {
    generateBatchingBOM(auth.token, batching!._id).then((_batching) => {
      if (_batching) {
        savedBatching = _batching;
        setBatching(_batching);
        setBatchingSaved(true);
        setExpandableRows(_batching.ingredients.map((item) => {
          return {
            ...item,
            _id: item._id ? item._id : new ObjectID().toHexString(),
            container_id: item.used_containers.length > 0 ? item.used_containers[0].container_id : '',
            lot_number: item.used_containers.length > 0 ? item.used_containers[0].lot_number : '',
            amount_to_use: item.used_containers.length > 0 ? item.used_containers[0].amount_to_use : 0,
            used_amount: 0,
            sub_rows: item.used_containers.length > 1 ? item.used_containers.slice(1, undefined) : [],
            has_enough: true
          }
        })
      );
      } else {
        console.log("Batching Not Updated");
      }
    });
  };

  const handleFinishBatching = () => {
    finishBatching(auth.token, batching!._id).then((_batching) => {
      if (_batching) {
        // window.location.reload();
        savedBatching = _batching;
        setBatching(_batching);
        setBatchingSaved(true);
      } else {
        console.log("Batching Not Updated");
      }
    });
  };

  const handleMarkBatchingCancelled = () => {
    markBatchingCancelled(auth.token, batching!._id).then((_batching) => {
      console.log("cancel batching", _batching, _batching?.status);
      if (_batching) {
        savedBatching = _batching;
        setBatching(_batching);
      } else {
        console.log("Batching Not Updated");
      }
    });
  };


  const handleDeleteRow = (row_id: string) => {
    setExpandableRows(
      expandableRows.map((row:expBatchIngr) => {
          return {...row, sub_rows: row.sub_rows.filter((sub_row) => sub_row._id !== row_id  )};
      }))
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

  const handleAddRow = (row_id: string) => {
    const index = rows.findIndex(
      (element) => element._id === row_id
    );
    const targetRow:IBatchingIngredient = expandableRows[index];
     setExpandableRows(
      expandableRows.map((row:expBatchIngr) => {
        if(row === targetRow) {
          return {...row, sub_rows: [...targetRow.sub_rows, { _id: new ObjectID().toHexString(), container_id: '', lot_number: '', confirm_lot_number: '', amount_used: null }]};
        }
        return row;
      })
    );

  };

  const saveBatching = async () => {

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

    //send new batching to server
    if (id === "new") {
      const newBatchingId = await createBatching(auth.token, batching!);
      if (newBatchingId) {
        navigate(`/batching/${newBatchingId}`, { replace: true });
        setBatching({ ...batching!, _id: newBatchingId });
      }
    } else {
      const updated = await updateBatching(auth.token, batching!);

      if (updated === false) {
        throw Error("Update Batching Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setBatchingSaved(true);
  };
  const cancelSaveBatching = () => {
    setBatching(savedBatching);
    let tempPur = { ...savedBatching! };
    setRows(tempPur.ingredients);
    setBatchingSaved(true);
  };

  if (batching == null) return null;

  return (
    <>
      <SaveForm
        display={!batchingSaved}
        onSave={saveBatching}
        onCancel={cancelSaveBatching}
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
              Batching
            </Button>
            <Grid sx={{ maxWidth: "85%" }} container spacing={3}>
              <Grid item xs={3}>
                <TextField
                  defaultValue={batching.batch_code}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.batch_code] = el)
                  }
                  error={inputVisuals[inputRefMap.batch_code].error}
                  helperText={inputVisuals[inputRefMap.batch_code].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.batch_code])
                  }
                  required={
                    inputMap[inputRefMap.batch_code].validation.required
                  }

                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Batching Code"}
                ></TextField>
              </Grid>
              <Grid item xs={6}>
                <StandaloneAutocomplete
                  initialValue={{ _id: batching.product_id, product_code: batching.product_code, name: batching.name }}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.product_id] = el)
                  }
                  error={inputVisuals[inputRefMap.product_id].error}
                  onBlur={(event:any) =>
                    onInputBlur(event, inputMap[inputRefMap.product_id])
                  }
                  helperText={inputVisuals[inputRefMap.product_id].helperText}
                  required={
                    inputMap[inputRefMap.product_id].validation.required
                  }
                  onChange={(e, value) => {
                    if(value) {
                      setBatching({ ...batching, product_id: value._id, product_code: value.product_code, name: value.name});
                    } else {
                      setBatching({...batching, product_id: null, product_code: '', name: '' })
                    }
                    }}
                  readOnly={batching.status != batchingStatus.DRAFT}
                  label={"Product"}
                  letterMin={0}
                  dbOption={"approved-product"}
                  getOptionLabel={(item: IProduct) => item.product_code ? item.product_code + ' | ' + item.name : ''}
                />
              </Grid>
              <Grid item xs={1.5}>
                <TextField
                  defaultValue={batching.quantity}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.quantity] = el)
                  }
                  error={inputVisuals[inputRefMap.quantity].error}
                  helperText={inputVisuals[inputRefMap.quantity].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.quantity])
                  }
                  required={
                    inputMap[inputRefMap.quantity].validation.required
                  }
                  InputProps={{
                    readOnly: batching.status != batchingStatus.DRAFT,
                  }}

                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Quantity"}
                  type={"number"}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setBatching({
                      ...batching,
                      date_created: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Batching Date"}
                  type={"date"}
                  value={batching.date_created.split('T')[0]}
                ></TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  onChange={(e) =>
                    setBatching({
                      ...batching,
                      date_needed: e.target.value,
                    })
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                  label={"Deadline Date"}
                  type={"date"}
                  value={batching.date_needed ? batching.date_needed.split('T')[0] : null}
                ></TextField>
              </Grid>
              <Grid item xs={2}>
                <Chip
                  label={
                    BatchingStatus[
                    batching?.status ? batching?.status - 1 : 5
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
                    BatchingStatus[
                    batching?.status ? batching?.status - 1 : 5
                    ][1]
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  defaultValue={batching.notes}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.notes] = el)
                  }
                  error={inputVisuals[inputRefMap.notes].error}
                  helperText={inputVisuals[inputRefMap.notes].helperText}
                  onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.notes])
                  }
                  required={
                    inputMap[inputRefMap.notes].validation.required
                  }
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
              disabled={id === "new" || batching.status != 6}
              variant="contained"
              onClick={() => handleConfirmBatching()}
            >
              Confirm
            </Button>

            <Button
              color="success"
              variant="contained"
              disabled={id === "new"}
              onClick={() => handleFinishBatching()}
            >
              Finish Batching
            </Button>
            <Button
              color="error"
              variant="outlined"
              disabled={id === "new"}
              onClick={() => handleMarkBatchingCancelled()}
            >
              Cancel Batching
            </Button>
          </Card>
        </div>
      </Card>

      <Card sx={{ mt: 2, padding: 2, overflowY: "auto" }}>


        <BatchingDataTable
          rows={expandableRows!}
          columns={expandableColumns}
          handleAddRow={ handleAddRow}
          sub_columns={sub_columns}
        ></BatchingDataTable>
      </Card>
    </>
  );
};