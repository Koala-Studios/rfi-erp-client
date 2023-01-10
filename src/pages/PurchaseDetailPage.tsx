import { Button, Card, Grid, IconButton, TextField, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getPurchase, IPurchaseOrder } from "../logic/purchase-order.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataTable } from "../components/utils/DataTable";
import { GridColDef, GridRenderCellParams, GridValueGetterParams } from "@mui/x-data-grid";

export const PurchaseDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);
  const [purchase, setPurchaseOrder] = React.useState<IPurchaseOrder | null>(null);
  const [rows, setRows] = React.useState<any>(null);
  const [rowCount, setRowCount] = React.useState<any>(0);
  const [status, setStatus] = React.useState<number>(0);
  const nonEditColumns : GridColDef[] = [
      { field: "material_code", headerName: "Material Code", width: 150 },
      { field: "material_name", headerName: "Material Name", width: 280 },
      { field: "amount", headerName: "Order Qty(KG)", type: "number", width: 110, align:'center' },
      { field: "received_amount", headerName: "Received Qty", type: "number", width: 100 , align:'center'},
      { field: "remaining_amount", headerName: "Awaiting Qty", type: "number", width: 100 , align:'center'},
      { field: "cost", headerName: "Cost($/KG)", type: "number", width: 100 , align:'center'},
      { field: "lot_number", headerName: "Lot#", type: "string", width: 120, editable:true , align:'right'},
      { field: "container_size", headerName: "Cont Size(KG)", type: "number", width: 120, editable:true , align:'center'},
      { field: "process_amount", headerName: "Qty to Process", type: "number", width: 120, editable:true , align:'center'},
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
                  onClick={() => 
                    console.log('send to QC')
                  }
                >
                  Send to Qc
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  style={{ marginLeft: 16 }}
                  onClick={() => 
                    console.log('send to gulag')
                  }
                >
                  Quarantine
                </Button>
              </strong>
            )
      },
  ]
const editColumns : GridColDef[] = [
  {
    field: "id",
    headerName: "Actions",
    align: "left",
    width: 80,
    renderCell: (params: GridRenderCellParams<string>) => (
          <strong>
          <Button
            variant="contained"
            color="error"
            size="small"
            style={{
              backgroundColor: "rgba(182,85,80,0.94)",
              fontSize: "18px",
              color: "black",
              maxWidth: "40px",
              maxHeight: "30px",
              minWidth: "40px",
              minHeight: "30px",
              marginRight: "10px",
            }}
            onClick={() => handleDeleteRow(params.row.id)}
          >
            -
          </Button>
          {/* <Button
            variant="outlined"
            color="success"
            size="small"
            style={{
              backgroundColor: "rgba(102,182,80,0.94)",
              fontSize: "14px",
              color: "black",
              maxWidth: "40px",
              maxHeight: "30px",
              minWidth: "40px",
              minHeight: "30px",
            }}
            onClick={() => handleAddRow(params.row.id)}
          >
            +
          </Button> */}
          </strong>
        )
    },
    { field: "material_code", headerName: "Material Code", width: 150 },
    { field: "material_name", headerName: "Material Name", width: 280 },
    { field: "amount", headerName: "Order Qty(KG)", type: "number", width: 110, align:'center', editable:true },
    { field: "cost", headerName: "Cost($/KG)", type: "number", width: 100 , align:'center', editable:true},
  ];

  useEffect(() => {
    getPurchase(auth.token, id!).then((purchase) => {
      setPurchaseOrder(purchase);
      let row_count = 0;
      const newRows = purchase!.order_items.map((item) => {
        return {
          id: item.material_id + row_count++,
          material_code: item.product_code,
          material_name: item.material_name,
          cost: item.price,
          amount: item.amount,
          status: item.status,
          container_size: null,
          process_amount: null,
          received_amount: 0, //gotta update these 
          remaining_amount: 0,
        };
      });
      setRows(newRows);
      setRowCount(row_count);
      console.log(purchase)
    });
  }, []);

  const handleDeleteRow = (row_id: string) => {
    setRows([...(rows.filter((m:{id:string}) => m.id !== row_id))]);
  };

  const handleInsertRow = (row_id: string) => {
    const index = rows.findIndex(
      (element: {id:string }) => element.id === row_id
    );
    setRows([
      ...rows.slice(0, index + 1),
      {
        id: "row" + rowCount,
        amount: 0,
        last_amount: 0,
        item_cost:0,
        cost:0
      },
      ...rows.slice(index == rows.length - 1 ? index + 2 : index + 1),
    ]);
    setRowCount(rowCount + 1);
  };

  const handleAddRow = () => {

    setRows([
      {
        id: "row" + rowCount,
        amount: 0,
        last_amount: 0,
        item_cost:0,
        cost:0
      },
      ...rows.slice(0),
    ]);
    setRowCount(rowCount + 1);
  };

  if (purchase == null || rows == null) return null;

  return (
    <>
    <Card variant="outlined" sx={{ padding: 3 }}>
      <Button
        sx={{ marginBottom: 4 }}
        aria-label="go back"
        size="large"
        variant="outlined"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon
          fontSize="small"
          sx={{
            marginRight: 1,
          }}
        />
        Back to Products
      </Button>
      <Button
        sx={{ marginBottom: 4 }}
        aria-label="go back"
        size="large"
        variant="contained"
        onClick={() => setStatus( status === 0 ? 1 : 0 )}
      >
        Toggle Edit (TESTING)
      </Button>
      
      <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                onChange={(e) =>console.log('cry')
                  // setpurchase({ ...purchase, purchase_code: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"purchase Code"}
                value={purchase.order_code}
              ></TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                // onChange={(e) =>console.log('cry')
                //   setpurchase({ ...purchase, start_date: e.target.value })
                // }
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Start Date"}
                type={"date"}
                // value={yyyymmdd(purchase.start_date)}
              ></TextField>
            </Grid>
            <Grid item xs={3}>
              {/* <DatePicker
                label="Basic example"
                value={undefined}
                // onChange={(newValue) => {
                //   setValue(newValue);
                // }}
                renderInput={(params) => <TextField {...params} />}
              /> */}
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"End Date"}
                type={"date"}
                // value={purchase.finish_date}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                onChange={(e) =>console.log('cry')
                  // setpurchase({ ...purchase, status: e.target.value ? parseInt(e.target.value) : 0 })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Status"}
                value={purchase.status}
              ></TextField>
            </Grid>


            <Grid item xs={3}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Supplier"}
              ></TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                onChange={(e) =>console.log('cry')
                  // setpurchase({ ...purchase, notes: e.target.value })
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


    </Card>
    <Card variant="outlined" sx={{ padding: 5, overflowY: 'auto' }}>
    <Button style={{marginBottom:10}} variant="contained" onClick={()=>{handleAddRow()}}>Add Row</Button>
    <DataTable  auto_height={true} rows={rows!} columns={status === 1 ? editColumns : nonEditColumns}></DataTable>
  </Card>;
    </>
    
  );
};
