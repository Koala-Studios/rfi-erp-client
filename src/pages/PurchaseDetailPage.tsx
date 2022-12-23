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

const columns: GridColDef[] = [
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
      ),
    },
    
  ];

  useEffect(() => {
    getPurchase(auth.token, id!).then((purchase) => {
      setPurchaseOrder(purchase);
      const newRows = purchase!.order_items.map((item) => {
        return {
          id: item.material_id + Math.random()*1.213,
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
      console.log(purchase)
    });
  }, []);

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
      <Typography variant="h6">Order Code: {purchase.order_code}</Typography>
      <Typography variant="h6">Order Date: {purchase.date_purchased}</Typography>


    </Card>
    <Card variant="outlined" sx={{ padding: 5, overflowY: 'auto' }}>
    <DataTable  auto_height={true} rows={rows!} columns={columns}></DataTable>
  </Card>;
    </>
    
  );
};
