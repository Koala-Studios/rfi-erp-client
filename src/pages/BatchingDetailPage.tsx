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
  import React, {  useEffect } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import { AuthContext } from "../components/navigation/AuthProvider";
  import ArrowBackIcon from "@mui/icons-material/ArrowBack";
  import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
  
  import DeleteIcon from "@mui/icons-material/DeleteOutlined";
  import TableAutocomplete from "../components/utils/TableAutocomplete";
  import { IInventory } from "../logic/inventory.logic";
  import { ObjectID } from "bson";
  import SaveForm from "../components/forms/SaveForm";
  import StandaloneAutocomplete from "../components/utils/StandaloneAutocomplete";
  import { ISupplier } from "../logic/supplier.logic";
  import { confirmBatching, createBatching, getBatching, IBatching, markBatchingCancelled, updateBatching, finishBatching, IBatchingIngredient, generateBatchingBOM, batchingStatus }  from "../logic/batching.logic";
import { IProduct } from "../logic/product.logic";
import { padding } from "@mui/system";
  
  let savedBatching: IBatching | null = null;
  
  const BatchingStatus = [
    ["SCHEDULED", "warning"],
    ["IN PROGRESS", "warning"],
    ["FINISHED", "success"],
    ["ABANDONED", "error"],
    ["CANCELLED", "error"],
    ["DRAFT", "warning"],
  ];
  
  export const BatchingDetailPage = () => {
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
    const addDays = (date:Date, days:number) => {
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
        product_name: "",
        product_id: null,
        quantity: 0,
        date_created: new Date().toISOString().split('T')[0],
        date_needed: addDays(new Date(),5).toISOString().split('T')[0]
    };
  
    const [batchingSaved, setBatchingSaved] = React.useState<boolean>(true);
    const [batching, setBatching] = React.useState<IBatching | null>(
      null
    );
  
    const [rows, setRows] = React.useState<IBatchingIngredient[]>([]);
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
            p!.ingredients.map((item:IBatchingIngredient) => {
              item._id = item._id ? item._id : new ObjectID().toHexString();
              return item;
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

    const draftColumns: GridColDef[] = [
      { field: "product_code", headerName: "Product Code", width: 150 },
      {
        field: "product_name",
        headerName: "Product Name",
        width: 350,
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
        width: 120,
        align: "right",
        editable: false,
      },
      {
        field: "used_amount",
        headerName: "Used Qty",
        type: "number",
        width: 120,
        align: "right",
        editable: true,
      },
      {
        field: "remaining_amount",
        headerName: "Remaining Qty",
        type: "number",
        width: 120,
        align: "right",
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
      finishBatching(auth.token, batching!).then((_batching) => {
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
            setRows(_batching.ingredients)
          } else {
            console.log("Batching Not Updated");
          }
        });
      };
  
    const handleDeleteRow = (row_id: string) => {
      setRows([...rows.filter((m: IBatchingIngredient) => m._id !== row_id)]);
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
  
    // const handleAddRow = () => {
    //   setRows([
    //     {
    //       _id: new ObjectID().toHexString(),
    //       product_id: "",
    //       product_code: "",
    //       product_name: "",
    //       required_amount: 0,
    //       used_amount: 0
    //     },
    //     ...rows.slice(0),
    //   ]);
    //   console.log(rows);
    // };
  
    const saveBatching = async () => {
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
                    onChange={(e) =>
                      setBatching({
                        ...batching,
                        batch_code: e.target.value,
                      })
                    }
                    spellCheck="false"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    variant="outlined"
                    label={"Batching Code"}
                    value={batching.batch_code}
                  ></TextField>
                </Grid>
                <Grid item xs={6}>
                <StandaloneAutocomplete
                    initialValue={{_id: batching.product_id, product_code: batching.product_code, name: batching.product_name}}
                    onChange={(e, value) => {
                        console.log(e, value, 'TESTER')
                    setBatching({ ...batching, product_id: value._id, product_code: value.product_code, product_name: value.name});
                    }}
                    readOnly={batching.status != batchingStatus.DRAFT}
                    label={"Product"}
                    letterMin={0}
                    dbOption={"approved-product"}
                    getOptionLabel={(item: IProduct) => item.product_code ? item.product_code + ' | ' + item.name : '' }
                />
                </Grid>
                <Grid item xs={1.5}>
                  <TextField
                    onChange={(e) =>
                      setBatching({
                        ...batching,
                        quantity: parseFloat(e.target.value),
                      })
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
                    value={batching.quantity}
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
                    value={batching.date_needed.split('T')[0]}
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
                style={{
                  display: `${batching.status === 6 ? "box" : "none"}`,
                }}
                disabled={id === "new"}
                variant="contained"
                onClick={() => handleConfirmBatching()}
              >
                Confirm
              </Button>
  
              <Button
                color="success"
                variant="contained"
                disabled={id === "new"}
                onClick={() => handleMarkBatchingCancelled()}//TODO: CHANGE THIS
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
        <Card variant="outlined" sx={{ mt: 2, padding: 2, overflowY: "auto" }}>
          <DataGrid
            autoHeight={true}
            rowHeight={46}
            rows={rows!}
            getRowId={(row) => row._id}
            processRowUpdate={(newRow) => {
              console.log(newRow);
              let pList = rows.slice();
              const rowIdx = rows.findIndex(
                (r: IBatchingIngredient) => r._id === newRow._id
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
                  received_amount: batching.status != 6,
                },
              },
            }}
            columns={draftColumns}
            onCellEditCommit={(e, value) => {
              handleEditCell(e.id.toString(), e.field, e.value);
              console.log("test", rows);
            }}
          ></DataGrid>
        </Card>
        <Card sx={{ mt: 2, padding: 2, overflowY: "auto" }}>
        <TableContainer component={Paper}>
        <Table           style={{
            width: "100%",
            minHeight: 100,
            height: "100%",
            padding:16,
            border: "1px solid #c9c9c9",
            borderRadius: "5px 5px 0 0",
          }}
          aria-label="spanning table">

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
              <TableCell sx={{ p:1, width:150 }}>Product Code</TableCell>
              <TableCell sx={{ p:1, width:300}}>Product Name</TableCell>
              <TableCell sx={{p:1}} align="right">Total Req Quantity</TableCell>
              <TableCell sx={{p:1}} align="right" >Used Qty.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
                <>
              <TableRow key={'test'}>
                <TableCell sx={{ p: 1 }} ><Typography variant="subtitle2">{row.product_code} </Typography></TableCell>
                <TableCell sx={{ p: 1 }} ><Typography variant="subtitle2">{row.product_name} </Typography></TableCell>
                <TableCell sx={{ p: 1 }} align="right" ><Typography variant="subtitle2">{row.required_amount}</Typography></TableCell>
                
                <TableCell sx={{ p: 1 }} align="right">{0}</TableCell>
              </TableRow>
            <TableRow>
              <TableCell sx={{ p: 1 }} rowSpan={2} colSpan={2}/>
              <TableCell sx={{ p: 1 }} align="right">
                    
                    <TextField
                        onChange={(e) =>
                          setBatching({
                            ...batching,
                            quantity: parseFloat(e.target.value),
                          })
                        }
                        fullWidth
                        sx={{width:120}}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        variant="standard"
                        type={"text"}
                        value={'LOT012TEST'}
                    ></TextField>
                </TableCell>
              <TableCell sx={{ p: 1, width:80 }} align="right">
                
                <TextField
                    onChange={(e) =>
                      setBatching({
                        ...batching,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    fullWidth
                    sx={{width:60}}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    variant="standard"
                    type={"number"}
                    value={(Math.random()*10).toPrecision(4)}
                  ></TextField>
                </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ p: 1 }} align="right">
                    
                    <TextField
                        onChange={(e) =>
                          setBatching({
                            ...batching,
                            quantity: parseFloat(e.target.value),
                          })
                        }
                        fullWidth
                        sx={{width:120}}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        variant="standard"
                        type={"text"}
                        value={'LOT013TEST2'}
                    ></TextField>
                </TableCell>
              <TableCell sx={{ p: 1, width:80 }} align="right">
                
                <TextField
                    onChange={(e) =>
                      setBatching({
                        ...batching,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    fullWidth
                    sx={{width:60}}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    variant="standard"
                    type={"number"}
                    value={(Math.random()*10).toPrecision(4)}
                  ></TextField>
                </TableCell>
            </TableRow>
            {/* <TableRow>
            <TableCell sx={{ p: 1, width:120 }} align="right">
                <TextField
                    onChange={(e) =>
                      setBatching({
                        ...batching,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    variant="standard"
                    type={"number"}
                    value={0}
                  ></TextField>
            </TableCell>
            </TableRow> */}
            </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
        </Card>
      </>
    );
  };