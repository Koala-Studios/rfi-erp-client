import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Collapse,
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

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import { IInventory } from "../../logic/inventory.logic";
import { ObjectID } from "bson";
import SaveForm from "../../components/forms/SaveForm";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import { ISupplier } from "../../logic/supplier.logic";
import { confirmBatching, createBatching, getBatching, IBatching, markBatchingCancelled, updateBatching, finishBatching, IBatchingIngredient, generateBatchingBOM, batchingStatus } from "../../logic/batching.logic";
import { IProduct } from "../../logic/product.logic";
import { padding } from "@mui/system";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import { BatchingDataTable } from "./BatchingDataTable";

let savedBatching: IBatching | null = null;

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
  product_id: null,
  quantity: NaN,
  date_created: new Date().toISOString().split('T')[0],
  date_needed: addDays(new Date(), 5).toISOString().split('T')[0]
};
const inputRefMap = {
  batch_code: 0,
  quantity: 1,
  notes: 2,
  date_created: 3,
  product_code: 4,
  test:5

};

const inputMap: InputInfo[] = [
  { label: "batch_code", ref: 0, validation: { required: true, genericVal: "Text" } },
  {
    label: "quantity",
    ref: 1,
    validation: { required: true, genericVal: "Text" },
  },
  {
    label: "date_created",
    ref: 3,
    validation: { required: true, genericVal: "Date" },
  },
  {
    label: "product_code",
    ref: 4,
    validation: { required: true, genericVal: "Text" },
  },
  
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
  const [expandableRows, setExpandableRows] = React.useState<IBatchingIngredient[]>([]);
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
        console.log(p);
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
          p!.ingredients.map((item: IBatchingIngredient) => {
            return {
              ...item,
              _id: item._id ? item._id : new ObjectID().toHexString(),
              container_id: item.used_containers.length > 0 ? item.used_containers[0].container_id : '',
              lot_number: item.used_containers.length > 0 ? item.used_containers[0].lot_number : '',
              amount_to_use: item.used_containers.length > 0 ? item.used_containers[0].amount_to_use.toFixed(5) : 0,
              used_amount: 0,
              sub_rows: item.used_containers.length > 1 ? item.used_containers.slice(1, undefined) : [],
              has_enough: item.has_enough
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
      width: 140,
      align: "right",
      editable: false,
    },
    {
      field: "remaining_amount",
      headerName: "Remaining Qty",
      type: "number",
      width: 140,
      align: "right",
      editable: true,
    },

    {
      field: "used_amount",
      headerName: "Total Used Qty",
      type: "number",
      width: 140,
      align: "right",
      editable: true,
    },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 160,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button //!Can't add render cell right now. will do manually for now..
            variant="outlined"
            color="info"
            size="small"
            style={{
              backgroundColor: "#1144ff15",
              fontSize: "19px",
              maxWidth: "40px",
              maxHeight: "30px",
              minWidth: "40px",
              minHeight: "30px",
            }}
            onClick={() => handleAddRow(params.row._id)}
          >
            +
          </Button>   
        </strong>
      ),
    },
    {
      field: "lot_number",
      headerName: "Lot Number",
      width: 120,
      align: "center",
      editable: true,
    },
    {
      field: "confirm_lot_number",
      headerName: "Lot Number",
      width: 120,
      align: "right",
      editable: true,
    },
    {
      field: "amount_to_use",
      headerName: "Qty To Use",
      type: "number",
      width: 120,
      align: "left",
      editable: true,
    },
    {
      field: "amount_used",
      headerName: "Qty Used",
      type: "number",
      width: 120,
      align: "left",
      editable: true,
    },
  ];
  const sub_columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 120,
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
    {
      field: "lot_number",
      headerName: "Lot Number",
      width: 120,
      align: "center",
      editable: true,
    },
    {
      field: "confirm_lot_number",
      headerName: "Lot Number",
      width: 120,
      align: "right",
      editable: true,
    },
    {
      field: "amount_to_use",
      headerName: "Qty To Use",
      type: "number",
      width: 120,
      align: "left",
      editable: true,
    },
    {
      field: "amount_used",
      headerName: "Qty Used",
      type: "number",
      width: 120,
      align: "left",
      editable: true,
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

  const handleGenerateBatchingBOM = () => {
    generateBatchingBOM(auth.token, batching!._id).then((_batching) => {
      if (_batching) {
        savedBatching = _batching;
        setBatching(_batching);
        setBatchingSaved(true);
        setExpandableRows(
          _batching!.ingredients.map((item: IBatchingIngredient) => {
            return {
              ...item,
              _id: item._id ? item._id : new ObjectID().toHexString(),
              container_id: item.used_containers.length > 0 ? item.used_containers[0].container_id : '',
              lot_number: item.used_containers.length > 0 ? item.used_containers[0].lot_number : '',
              amount_to_use: item.used_containers.length > 0 ? item.used_containers[0].amount_to_use : 0,
              used_amount: 0,
              sub_rows: item.used_containers.length > 1 ? item.used_containers.slice(1, undefined) : [],
              has_enough: item.has_enough
            }
          })
        );
      } else {
        console.log("Batching Not Updated");
      }
    });
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
    const index = expandableRows.findIndex(
      (element) => element._id === row_id
    );
    setExpandableRows(expandableRows.map((row:IBatchingIngredient, r_index) => {
      if(r_index != index) {
        return row;
      } else {
        row.sub_rows = [...row.sub_rows, {_id: new ObjectID().toHexString(),
          container_id:'',
          lot_number: '',
          amount_to_use: 0,
          used_amount: 0}]
        return row;
      }
      }));
    console.log(rows);
  };

  const handleDeleteRow = (row_id: string) => {
    console.log('test', row_id)
    setExpandableRows(expandableRows.map((row:IBatchingIngredient) => {
        const new_row = {...row, sub_rows: row.sub_rows.filter((r:any) => r._id != row_id)}
        return new_row;
      }));
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
                    (inputRefs.current[inputRefMap.product_code] = el)
                  }
                  error={inputVisuals[inputRefMap.product_code].error}
                  helperText={inputVisuals[inputRefMap.product_code].helperText}
                  onBlur={(event: any) =>
                    onInputBlur(event, inputMap[inputRefMap.product_code])
                  }
                  required={
                    inputMap[inputRefMap.batch_code].validation.required
                  }
                  onChange={(e, value) => {
                    console.log(e, value, 'TESTER')
                    setBatching({ ...batching, product_id: value._id, product_code: value.product_code, name: value.name });
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
                  onChange={(e) =>
                    setBatching({ ...batching, notes: e.target.value })
                  }
                  spellCheck="false"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                  variant="outlined"
                  label={"Notes"}
                  multiline
                  rows={6}
                  value={batching.notes}
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
          sub_columns={sub_columns}
        ></BatchingDataTable>
      </Card>
      <Card sx={{ mt: 2, padding: 2, overflowY: "auto" }}>
      <TableContainer
        component={Paper}
        style={{
          width: "100%",
          minHeight: 100,
          height: "100%",
          border: "1px solid #c9c9c9",
          borderBottom: "none",
          borderRadius: "5px 5px 0 0",
        }}
      >
        <Table aria-label="collapsible table" style={{ position: "relative" }}>
          <TableHead
            style={{
              position: "sticky",
              top: 0,
              background: "white",
              boxShadow: "0 1px 0 0 #e1e1e1",
              zIndex: 10,
            }}
          >
            <TableRow
              sx={{
                maxHeight: 50,
                height: 50,
              }}
            >
              <TableCell sx={{ p: 1 }}></TableCell>
              {expandableColumns.map((col) => (
                <TableCell sx={{ p: 1 }} align={col.align} contentEditable={col.editable} width={col.width}>{col.headerName}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody style={{ overflowY: "scroll", height: "400px!important" }}>
            {/* {dataOptions.rows.map((row: IInventoryStockGrouped) => (
                    <ExpandableRow key={row.name} row={row} />
                  ))} */}
            {expandableRows.map((row_item) => (
              <ExpandableRow
                key={row_item.product_id}
                columns={expandableColumns}
                sub_columns={sub_columns}
                handleAddRow={handleAddRow}
                row={row_item}
              ></ExpandableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Card>

    </>
  );
};



const ExpandableRow = (props: {
  columns: GridColDef[];
  sub_columns: GridColDef[];
  handleAddRow:(row_id:string) => void;
  row: any;
}) => {

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "none!important" },
        }}
      >
        <TableCell sx={{ p: 0.7 }} width={50}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            style={{ display: props.row.sub_rows.length === 0 ? 'none' : 'block' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {props.columns.map((col, index) => (
          <TableCell sx={{ p: 1, fontWeight: '500', fontSize: '0.9rem' }}>
            {index == 5 &&
              <strong>
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  style={{
                    backgroundColor: "#1144ff15",
                    fontSize: "19px",
                    maxWidth: "40px",
                    maxHeight: "30px",
                    minWidth: "40px",
                    minHeight: "30px",
                  }}  
                onClick={() => props.handleAddRow(props.row._id)}
                >
                  +
                </Button>
              </strong>
            }
            {props.row[col.field]}</TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell
          sx={{ p: 0 }}
          // style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={12}
        >
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{ background: "#ebedf0", pl: 3.5 }}
          >
            {/* <Box sx={{
              marginBottom: 2, p: "0 0px"
            }}> */}

            {console.log(props.sub_columns)}
            <DataGrid rows={props.row.sub_rows}
              headerHeight={0}
              components={{
                Header: () => null,
              }}
              columns={props.sub_columns}
              getRowId={(row) => row._id}
              sx={{ width:'620px', float: 'right', height: ((40 * (props.row.sub_rows.length))), maxHeight: '200px' }} rowHeight={39} hideFooter={true}
            />
            {/* </Box> */}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
