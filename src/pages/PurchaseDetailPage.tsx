import { Button, Card, IconButton, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getPurchase, IPurchaseOrder } from "../logic/purchase-order.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DataTable } from "../components/utils/DataTable";
import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid";

export const PurchaseDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);
  const [purchase, setPurchaseOrder] = React.useState<IPurchaseOrder | null>(null);
  const [rows, setRows] = React.useState<any>(null);

const columns: GridColDef[] = [
    { field: "material_code", headerName: "Material Code", width: 150 },
    { field: "material_name", headerName: "Material Name", width: 300 },
    { field: "quantity", headerName: "Qty(%)", type: "number", width: 90 },
    { field: "cost", headerName: "Cost($)", type: "number", width: 100 },
  ];

  useEffect(() => {
    getPurchase(auth.token, id!).then((purchase) => {
      setPurchaseOrder(purchase);
      const newRows = purchase!.order_items.map((item) => {
        return {
          id: item.material_id,
          material_code: item.product_code,
          material_name: item.material_name,
          cost: item.price,
          quantity: item.amount,
          status: item.status,

        };
      });
      setRows(newRows);
      console.log(purchase)
    });
  }, []);

  if (purchase == null || rows == null) return null;

  return (
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
      <Typography variant="h6">Product Code: {purchase.order_code}</Typography>
      <Typography variant="h6">Product Name: {purchase.date_purchased}</Typography>
      <Typography variant="h6">
        {/* Approved Version: {product.approved_version} */}
      </Typography>
      {/* <Typography variant="h6">Cost: {product.cost}</Typography> */}
      <Button sx={{ marginTop: 3 }} variant="contained" size="large">
        View Formula
      </Button>

      <Card variant="outlined" sx={{ padding: 5, overflowY: 'auto' }}>
    
    <DataTable  auto_height={true} rows={rows!} columns={columns}></DataTable>
  </Card>;
    </Card>
  );
};
