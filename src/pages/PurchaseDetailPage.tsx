import { Button, Card, IconButton, Typography } from "@mui/material";
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
      { field: "received_amount", headerName: "Recvd Qty(KG)", type: "number", width: 110 , align:'center'},
      { field: "cost", headerName: "Cost($/KG)", type: "number", width: 100 , align:'center'},
      { field: "lot_number", headerName: "Lot#", type: "string", width: 120, editable:true , align:'right'},
      { field: "container_size", headerName: "Cont Size(KG/x)", type: "number", width: 120, editable:true , align:'center'},
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
    width: 240,
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
          <Button
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
          </Button>
          </strong>
        )
    },
    { field: "material_code", headerName: "Material Code", width: 150 },
    { field: "material_name", headerName: "Material Name", width: 280 },
    { field: "amount", headerName: "Order Qty(KG)", type: "number", width: 110, align:'center' },
    { field: "received_amount", headerName: "Recvd Qty(KG)", type: "number", width: 110 , align:'center'},
    { field: "cost", headerName: "Cost($/KG)", type: "number", width: 100 , align:'center'},
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

  const handleAddRow = (row_id: string) => {
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
    // setEditMode("row" + rowCount); //onBlur in autocomplete clashes with this, also slows page down
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
      
      <Typography variant="h6">Editing?: {status === 1 ? 'TRUE' : 'FALSE'}</Typography>

      <Typography variant="h6">Order Code: {purchase.order_code}</Typography>
      <Typography variant="h6">Order Date: {purchase.date_purchased}</Typography>


    </Card>
    <Card variant="outlined" sx={{ padding: 5, overflowY: 'auto' }}>
    <DataTable  auto_height={true} rows={rows!} columns={status === 1 ? editColumns : nonEditColumns}></DataTable>
  </Card>;
    </>
    
  );
};
