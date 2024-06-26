import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  TableCell,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";

import { ObjectID } from "bson";
import { TableGridColDef } from "../../components/batching/BatchingTable";
import SaveForm from "../../components/forms/SaveForm";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import TableAutocomplete from "../../components/utils/TableAutocomplete";
import {
  IBatching,
  IBatchingContainer,
  IBatchingIngredient,
  batchingStatus,
  confirmBatching,
  createBatching,
  finishBatching,
  generateBatchingBOM,
  getBatching,
  markBatchingCancelled,
  updateBatching,
} from "../../logic/batching.logic";
import { IInventoryStock } from "../../logic/inventory-stock.logic";
import { IProduct } from "../../logic/product.logic";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import { BatchingDataTable } from "./BatchingDataTable";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

let savedBatching: IBatching | null = null;

interface expBatchIngr extends IBatchingIngredient {
  _id: string;
  required_amount: number;
  total_used_amount: number;
  sub_rows: IBatchingContainer[];
  // has_enough: boolean;
  remaining_amount: number;

  //used container info
  row_id: string;
  container_id: string;
  lot_number: string;
  confirm_lot_number: string;
  used_amount: number;
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
};

const emptyBatching: IBatching = {
  _id: "",
  status: 1,
  source_id: "",
  source_type: "",
  batch_code: "",
  ingredients: [],
  notes: "",
  product_code: "",
  name: "",
  product_id: "",
  quantity: NaN,
  date_created: new Date().toISOString().split("T")[0],
  date_needed: addDays(new Date(), 5).toISOString().split("T")[0],
};
const inputRefMap = {
  batch_code: 0,
  quantity: 1,
  notes: 2,
  product_id: 3,
};

const inputMap: InputInfo[] = [
  {
    label: "batch_code",
    ref: 0,
    validation: { required: true, genericVal: "Text" },
  },
  {
    label: "quantity",
    ref: 1,
    validation: { required: true, genericVal: "Text" },
  },
  {
    label: "notes",
    ref: 2,
    validation: { required: false, genericVal: "Text" },
  },

  {
    label: "product_id",
    ref: 3,
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

  const handleEditProductRow = (rowid: string, value: IInventoryStock) => {
    const index = expandableRows.findIndex((element) => element._id === rowid);
    const targetRow: IBatchingIngredient = expandableRows[index];
    setExpandableRows(
      expandableRows.map((row) => {
        if (row === targetRow) {
          return {
            ...row,
            container_id: value._id,
            confirm_lot_number: "",
            lot_number: value.lot_number,
            used_amount: 0,
          };
        }
        return row;
      })
    );
  };

  const handleBatchRecursive = (prod_id: string) => {};

  const handleEditProductSubRow = (rowid: string, value: IInventoryStock) => {
    const index = expandableRows.findIndex((element) =>
      element.sub_rows.some((e) => e._id === rowid)
    );
    const rowIndx = expandableRows[index].sub_rows.findIndex(
      (e) => e._id === rowid
    );
    const targetRow: IBatchingIngredient = expandableRows[index];
    setExpandableRows(
      expandableRows.map((row) => {
        if (row === targetRow) {
          // targetRow.sub_rows.splice(index, 1,
          //   {_id:rowid, container_id: value._id, lot_number: value.lot_number,required_amount: targetRow.required_amount - targetRow.used_amount, used_amount: 0, has_enough: ((value.remaining_amount - (targetRow.required_amount - targetRow.used_amount)) >= 0)}
          // )
          return {
            ...row,
            sub_rows: [
              ...targetRow.sub_rows.slice(0, rowIndx),
              {
                _id: rowid,
                container_id: value._id,
                confirm_lot_number: "",
                lot_number: value.lot_number,
                used_amount: 0,
              },
              ...targetRow.sub_rows.slice(
                rowIndx + 1,
                targetRow.sub_rows.length - 1
              ),
            ],
          };
        }
        return row;
      })
    );
  };

  const [batchingSaved, setBatchingSaved] = React.useState<boolean>(true);
  const [batching, setBatching] = React.useState<IBatching | null>(null);

  const [rows, setRows] = React.useState<IBatchingIngredient[]>([]);
  const [expandableRows, setExpandableRows] = React.useState<expBatchIngr[]>(
    []
  );
  const [receiveMode, setReceiveMode] = React.useState<boolean>(false);

  useEffect(() => {
    if (id === "new") {
      savedBatching = emptyBatching;
      setBatching(emptyBatching);
    } else {
      getBatching(auth.token, id!).then((b) => {
        const tempBatching = { ...b! };
        savedBatching = tempBatching;
        setBatching(b!);
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
        setExpandableRows(reformatIngredients(b!));
        setReceiveMode(b!.status <= 3);
        // setBatchingSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (batching === null) return;
    setReceiveMode(batching.status <= 3);

    if (batchingSaved === false) return;

    if (JSON.stringify(savedBatching) !== JSON.stringify(batching)) {
      setBatchingSaved(false);
    }
  }, [batching]);

  useEffect(() => {
    //temp maybe
    if (rows.length !== 0 && rows !== null && !receiveMode) {
      if (JSON.stringify(savedBatching?.ingredients) !== JSON.stringify(rows)) {
        setBatchingSaved(false);
      }

      const tempBatching = { ...batching! }; // gotta find a nicer way around this lol..
      tempBatching.ingredients = rows;
      setBatching(tempBatching);
    }
  }, [rows]);

  const expandableColumns: TableGridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 70 },
    {
      field: "product_name",
      headerName: "Product Name",
      width: 250,
      sortable: false,
      filterable: false,
    },
    {
      field: "instructions",
      headerName: "Instructions",
      width: 250,
      sortable: false,
      filterable: false,
    },
    {
      field: "required_amount",
      headerName: "Required Qty",
      type: "number",
      width: 100,
      align: "center",
      editable: false,
      valueGetter: (params: any) =>
        params.required_amount
          ? params.required_amount.toFixed(4) +
            (params.required_amount < 0.1
              ? "(" +
                (params.required_amount.toFixed(4) * 1000).toFixed(1) +
                "g)"
              : "")
          : params.remaining_amount,
    },
    {
      field: "total_used_amount",
      headerName: "Total Used Qty",
      type: "number",
      width: 100,
      align: "center",
      editable: false,
      valueGetter: (params: any) =>
        params.total_used_amount
          ? params.total_used_amount.toFixed(4)
          : params.total_used_amount,
    },
    {
      field: "remaining_amount",
      headerName: "Remaining Qty",
      type: "number",
      width: 100,
      align: "center",
      editable: false,
      valueGetter: (params: any) =>
        params.remaining_amount
          ? params.remaining_amount.toFixed(4) +
            (params.remaining_amount < 0.1 &&
            params.remaining_amount.toFixed(4) > 0
              ? "(" +
                (params.remaining_amount.toFixed(4) * 1000).toFixed(1) +
                "g)"
              : "")
          : params.remaining_amount,
    },
    {
      field: "lot_number",
      headerName: "Lot #",
      width: 100,
      sortable: false,
      filterable: false,
      customRender: (row: any) => (
        <TableCell sx={{ width: 100, p: 0 }}>
          <TableAutocomplete
            width={200}
            dropDownWidth={260}
            initialValue={row.lot_number}
            searchOptionalVar={row.product_id}
            // readOnly={batching!.status === 6 || purchase!.status === 4}
            dbOption="container-specific"
            handleEditRow={handleEditProductRow}
            rowParams={{ row: row }}
            letterMin={0}
            getOptionLabel={(item: any) => {
              return item.lot_number !== undefined ? item.lot_number : "";
              // (
              //   <>
              //     {" "}
              //     {item?.is_open ? (
              //       <Battery4BarIcon sx={{ color: "green" }} />
              //     ) : (
              //       ""
              //     )}{" "}
              //     {item?.lot_number ? `${item.lot_number}` : ""}
              //   </>
              // );
            }}
          />
        </TableCell>
      ),
    },
    {
      field: "confirm_lot_number",
      headerName: "Confirm Lot #",
      width: 120,
      type: "string",
      align: "center",
      editable: true,
    },
    {
      field: "used_amount",
      headerName: "Qty Used",
      type: "number",
      width: 80,
      align: "right",
      editable: true,
    },
    {
      field: "product_id",
      headerName: "Actions",
      type: "boolean",
      width: 100,
      align: "right",
      editable: false,
      customRender: (row: any) => {
        return (
          <TableCell
            sx={{
              p: 1,
              pl: "10px",
              pr: "10px",
              fontWeight: "500",
              fontSize: "0.9rem",
              width: 65,
            }}
          >
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
                marginRight: 2,
              }}
              onClick={() => {
                handleAddRow(row["_id"]);
                window.dispatchEvent(
                  new CustomEvent("BatchingRowAdd", {
                    detail: {
                      _id: row["_id"],
                    },
                  })
                );
              }}
            >
              +
            </Button>
            {/* KEY BATCHING BUTTON! */}
            {row["avoid_recur"] && (
              <FormDialog
                product={{
                  _id: row["product_id"],
                  code: row["product_code"],
                  name: row["product_name"],
                }}
                batching_id={batching!._id}
              />
            )}{" "}
          </TableCell>
        );
      },
    },
  ];
  const sub_columns: TableGridColDef[] = [
    {
      field: "lot_number",
      headerName: "Lot #",
      width: 100,
      align: "left",
      sortable: false,
      filterable: false,
      customRender: (row: any) => (
        <TableCell sx={{ width: 100, p: 0 }}>
          <TableAutocomplete
            width={200}
            dropDownWidth={260}
            initialValue={row.lot_number}
            searchOptionalVar={row.product_id} //specific container dropdown
            // readOnly={batching!.status === 6 || purchase!.status === 4}
            dbOption="container-specific"
            handleEditRow={handleEditProductSubRow}
            rowParams={{ row: row }}
            letterMin={0}
            getOptionLabel={(item: any) => {
              return item.lot_number !== undefined ? item.lot_number : "";
            }}
          />
        </TableCell>
      ),
    },
    {
      field: "confirm_lot_number",
      headerName: "Lot Number",
      width: 120,
      align: "left",
      editable: true,
    },
    {
      field: "used_amount",
      headerName: "Qty Used",
      type: "number",
      width: 110,
      align: "right",
      editable: true,
    },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 120,
      customRender: (row: any) => {
        return (
          <TableCell
            sx={{
              p: 1,
              pl: "10px",
              pr: "10px",
              width: 120,
              fontWeight: "500",
              fontSize: "0.9rem",
            }}
          >
            <Button
              variant="outlined"
              color="info"
              size="small"
              style={{
                borderColor: "#bb221155",
                color: "#bb221155",
                backgroundColor: "#ff221115",
                fontSize: "19px",
                maxWidth: "40px",
                maxHeight: "30px",
                minWidth: "40px",
                minHeight: "30px",
              }}
              onClick={() => handleDeleteRow(row["_id"])}
            >
              -
            </Button>
          </TableCell>
        );
      },
    },
  ];

  const getSourceLink = (src_id: string, src_type: string) => {
    switch (src_type) {
      case "Batching":
        return "/batching/" + src_id;
      case "SalesOrder":
        return "/sales-orders/" + src_id;
    }
    return "";
  };

  const reformatIngredients = (_batching: IBatching) => {
    const newIng = _batching.ingredients.map((item) => {
      return {
        ...item,
        _id: item._id ? item._id : new ObjectID().toHexString(),
        row_id:
          item.used_containers.length > 0 ? item.used_containers[0]._id : "",
        container_id:
          item.used_containers.length > 0
            ? item.used_containers[0].container_id
            : "",
        lot_number:
          item.used_containers.length > 0
            ? item.used_containers[0].lot_number
            : "",
        confirm_lot_number:
          item.used_containers.length > 0
            ? item.used_containers[0].confirm_lot_number
            : "",
        used_amount:
          item.used_containers.length > 0
            ? item.used_containers[0].used_amount
            : 0,
        total_used_amount: item.total_used_amount,
        sub_rows:
          item.used_containers.length > 1
            ? item.used_containers.slice(1, undefined)
            : [],
        // has_enough: true,
        remaining_amount: item.required_amount - item.total_used_amount,
        avoid_recur: item.avoid_recur,
      };
    });
    return newIng;
  };

  const handleConfirmBatching = () => {
    confirmBatching(auth.token, batching!).then(
      (_batching: IBatching | null) => {
        if (_batching) {
          savedBatching = _batching;
          setBatching(_batching);
          setExpandableRows(reformatIngredients(_batching));
          console.log(_batching, "TESTING");
          setBatchingSaved(true);
          // handleGenerateBatchingBOM();
        } else {
          console.log("Batching Not Updated");
        }
      }
    );
  };
  const handleBOMBatching = () => {
    handleGenerateBatchingBOM();
  };

  const handleGenerateBatchingBOM = () => {
    generateBatchingBOM(auth.token, batching!._id).then((_batching) => {
      if (_batching) {
        savedBatching = _batching;
        setBatching(_batching);
        setBatchingSaved(true);
        setExpandableRows(reformatIngredients(_batching));
      } else {
        console.log("Batching Not Updated");
      }
    });
  };

  const handleFinishBatching = () => {
    finishBatching(batching!._id).then((_batching) => {
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
      expandableRows.map((row: expBatchIngr) => {
        return {
          ...row,
          sub_rows: row.sub_rows.filter((sub_row) => sub_row._id !== row_id),
        };
      })
    );
  };

  const handleEditCell = (row_id: string, field: string, value: any) => {
    //TODO: DANIEL THIS NNEEDS FIX
    console.log(value, "hopefully empty");
    let rowIndex = expandableRows.findIndex((r: any) => r._id === row_id);
    let subRow = -1;
    if (rowIndex < 0) {
      expandableRows.forEach((element, index) => {
        const temp = element.sub_rows.findIndex((r: any) => r._id === row_id);
        if (temp > -1) {
          rowIndex = index;
          subRow = temp;
        }
      });
    }
    const total_used = getTotalUsedOnChange(
      rowIndex,
      parseFloat(value),
      subRow
    );
    const newRow =
      subRow === -1
        ? {
            ...expandableRows[rowIndex],
            //TODO: THIS PART NOT WORKING FOR SOME REASON?
            total_used_amount:
              field === "used_amount"
                ? total_used
                : expandableRows[rowIndex].total_used_amount,
            remaining_amount:
              field === "used_amount"
                ? expandableRows[rowIndex].required_amount - total_used
                : expandableRows[rowIndex].remaining_amount,
            [field]: field === "used_amount" ? parseFloat(value) : value,
          }
        : {
            ...expandableRows[rowIndex],
            total_used_amount:
              field === "used_amount"
                ? total_used
                : expandableRows[rowIndex].total_used_amount,
            remaining_amount:
              field === "used_amount"
                ? expandableRows[rowIndex].required_amount - total_used
                : expandableRows[rowIndex].remaining_amount,
            sub_rows: [
              ...expandableRows[rowIndex].sub_rows.slice(0, subRow),
              {
                ...expandableRows[rowIndex].sub_rows[subRow],
                [field]: field === "used_amount" ? parseFloat(value) : value,
              },
              ...expandableRows[rowIndex].sub_rows.slice(
                subRow + 1,
                expandableRows[rowIndex].sub_rows.length
              ),
            ],
          };
    const tempRows = [
      ...expandableRows.slice(0, rowIndex),
      newRow,
      ...expandableRows.slice(rowIndex + 1, expandableRows.length),
    ];
    setExpandableRows(tempRows);

    const ingredients = tempRows.map((row) => {
      return {
        _id: row._id,
        product_id: row.product_id,
        product_code: row.product_code,
        product_name: row.product_name,
        required_amount: row.required_amount,
        used_amount: row.used_amount,
        used_containers: [
          {
            _id: row.row_id,
            product_id: row.product_id,
            container_id: row.container_id,
            lot_number: row.lot_number,
            confirm_lot_number: row.confirm_lot_number,
            used_amount: row.used_amount,
          },
          ...row.sub_rows,
        ],
        total_used_amount: row.total_used_amount,
        avoid_recur: row.avoid_recur,
      };
    });
    console.log(ingredients, "TEST");
    setBatching({ ...batching!, ingredients: ingredients });
    setBatchingSaved(false);
  };

  const getTotalUsedOnChange = (
    rowIndex: number,
    currentChange: number,
    subRow: number
  ) => {
    let spliced = expandableRows[rowIndex].sub_rows.slice();
    spliced.splice(subRow, 1);
    let total =
      subRow === -1
        ? currentChange +
          expandableRows[rowIndex].sub_rows.reduce((a, b) => {
            return a + b.used_amount;
          }, 0)
        : expandableRows[rowIndex].used_amount +
          currentChange +
          spliced.reduce((a, b) => {
            return a + b.used_amount;
          }, 0);
    return total;
  };

  const handleChooseContainer = (row_id: string, value: IBatchingContainer) => {
    const index = expandableRows.findIndex((element) => element._id === row_id);
    const targetRow: IBatchingIngredient = expandableRows[index];
    setExpandableRows(
      expandableRows.map((row: expBatchIngr) => {
        if (row === targetRow) {
          return {
            ...row,
            lot_number: value.lot_number,
            container_id: value._id,
          };
        }
        return row;
      })
    );
  };

  const handleAddRow = (row_id: string) => {
    const index = expandableRows.findIndex((element) => element._id === row_id);
    const targetRow: IBatchingIngredient = expandableRows[index];
    setExpandableRows(
      expandableRows.map((row: expBatchIngr) => {
        if (row === targetRow) {
          return {
            ...row,
            sub_rows: [
              ...targetRow.sub_rows,
              {
                _id: new ObjectID().toHexString(),
                product_id: row.product_id,
                container_id: "",
                lot_number: "",
                confirm_lot_number: "",
                used_amount: null,
              },
            ],
          };
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
      const _batching = await createBatching(auth.token, batching!);
      if (_batching) {
        navigate(`/batching/${_batching._id}`, { replace: true });
        setBatching(_batching);
        setExpandableRows(reformatIngredients(_batching));
        console.log(_batching, "Testing new creation");
      }
    } else {
      //Recompile with proper format to save
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

    let tempBatching = { ...savedBatching! };
    setExpandableRows(reformatIngredients(tempBatching));
    setBatchingSaved(true);
  };

  if (batching === null) return null;

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
              onClick={() => navigate("./../")}
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
                  initialValue={{
                    _id: batching.product_id,
                    product_code: batching.product_code,
                    name: batching.name,
                  }}
                  inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.product_id] = el)
                  }
                  error={inputVisuals[inputRefMap.product_id].error}
                  onBlur={(event: any) =>
                    onInputBlur(event, inputMap[inputRefMap.product_id])
                  }
                  helperText={inputVisuals[inputRefMap.product_id].helperText}
                  required={
                    inputMap[inputRefMap.product_id].validation.required
                  }
                  onChange={(e, value) => {
                    if (value) {
                      setBatching({
                        ...batching,
                        product_id: value._id,
                        product_code: value.product_code,
                        name: value.name,
                      });
                    } else {
                      setBatching({
                        ...batching,
                        product_id: null,
                        product_code: "",
                        name: "",
                      });
                    }
                  }}
                  readOnly={batching.status !== batchingStatus.DRAFT}
                  label={"Product"}
                  letterMin={0}
                  dbOption={"approved-product-all"}
                  getOptionLabel={(item: IProduct) =>
                    item.product_code
                      ? item.product_code + " | " + item.name
                      : ""
                  }
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
                  required={inputMap[inputRefMap.quantity].validation.required}
                  InputProps={{
                    readOnly: batching.status !== batchingStatus.DRAFT,
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
                  value={batching.date_created.split("T")[0]}
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
                  value={
                    batching.date_needed
                      ? batching.date_needed.split("T")[0]
                      : null
                  }
                ></TextField>
              </Grid>
              <Grid item xs={2.5}>
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
              {batching.source_id && batching.source_type && (
                <Grid item xs={2}>
                  <Button
                    aria-label="go back"
                    size="medium"
                    variant="outlined"
                    onClick={() =>
                      navigate(
                        getSourceLink(
                          batching!.source_id,
                          batching!.source_type
                        )
                      )
                    }
                  >
                    View Source
                  </Button>
                </Grid>
              )}

              <Grid item xs={6}>
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
              disabled={id === "new" || batching.status !== 1}
              variant="contained"
              onClick={() => handleConfirmBatching()}
            >
              Schedule
            </Button>
            <Button
              disabled={id === "new" || batching.status !== 2}
              variant="contained"
              onClick={() => handleBOMBatching()}
            >
              Generate BOM
            </Button>
            <Button
              color="success"
              variant="contained"
              disabled={id === "new" || batching.status !== 3}
              onClick={() => handleFinishBatching()}
            >
              Finish Batching
            </Button>
            <Button
              color="error"
              variant="outlined"
              disabled={
                id === "new" || batching.status < 2 || batching.status > 3
              }
              onClick={() => handleMarkBatchingCancelled()}
            >
              Abandon Batching
            </Button>
            <Button
              color="error"
              variant="outlined"
              disabled={id === "new" || batching.status > 1}
              onClick={() => handleMarkBatchingCancelled()}
            >
              Cancel Batching
            </Button>
          </Card>
        </div>
      </Card>
      {batching!.status >= 1 && (
        <Card
          sx={{ mt: 2, padding: 2, overflowY: "hidden", height: "calc(100%)" }}
        >
          <BatchingDataTable
            rows={expandableRows!}
            columns={expandableColumns}
            handleChooseContainer={handleChooseContainer}
            handleAddRow={handleAddRow}
            handleEditCell={handleEditCell}
            sub_columns={sub_columns}
          ></BatchingDataTable>
        </Card>
      )}
    </>
  );
};

const CustomTableAdd = (handleAddRow: any, row_id: string) => {
  return (
    <TableCell sx={{ p: 1, fontWeight: "500", fontSize: "0.9rem" }}>
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
          onClick={() => handleAddRow(row_id)}
        >
          +
        </Button>
      </strong>
    </TableCell>
  );
};

export default function FormDialog(props: {
  product: { _id: string; code: string; name: string };
  batching_id: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [quantity, setQuantity] = React.useState(0);
  const navigate = useNavigate();
  const auth = React.useContext(AuthContext);
  const batching: IBatching = {
    _id: "",
    status: 1,
    source_id: props.batching_id,
    source_type: "batching",
    batch_code: "test" + Math.random(),
    ingredients: [],
    notes: "",
    product_code: props.product.code,
    name: props.product.name,
    product_id: props.product._id,
    quantity: quantity,
    date_created: new Date().toISOString().split("T")[0],
    date_needed: addDays(new Date(), 5).toISOString().split("T")[0],
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleConfirm = async () => {
    const newBatchingId = await createBatching(auth.token, batching!);
    handleClose();
    if (newBatchingId) {
      let handle = window.open("../batching/" + newBatchingId, "_blank");
      handle?.blur();
      window.focus();
      // setBatching({ ...batching!, _id: newBatchingId });
    } else {
      throw Error("Recursive Batch Creation Error");
    }
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
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
        onClick={() => {
          // handleBatchRecursive(row["product_id"]);
          handleClickOpen();
          console.log(props.product._id, "TEST");
        }}
      >
        B
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create {props.product.code} Batch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            How much would you like to produce?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Qty"
            type="number"
            variant="standard"
            value={quantity}
            onChange={(e) => {
              setQuantity(parseFloat(e.target.value));
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
