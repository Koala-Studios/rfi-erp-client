import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
} from "@mui/x-data-grid";
import { Button, Card, Rating } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";
import { listSupplierProducts } from "../../logic/supplier-product.logic";

const SupplierProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    {
        label: "Product Code",
        field: "product_code",
        type: "text",
      },{
        label: "Product Name",
        field: "name",
        type: "text",
      },{
        label: "Supplier Sku",
        field: "name",
        type: "text",
      },{
        label: "Cost/KG",
        field: "cost",
        type: "number",
      },{
        label: "Cas Number",
        field: "cas_number",
        type: "text",
      },
  
  ];
  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 120 },
    { field: "name", headerName: "Product Name", width:350 },
    {
      field: "cost",
      headerName: "Cost/KG",
      width: 120,
    },
    { field: "description", headerName: "Description", width: 350 },
    { field: "supplier_sku", headerName: "Supplier SKU", width: 120 },
    { field: "cas_number", headerName: "Cas Number", width: 140 },
  ];


  React.useEffect(() => {
    listSupplierProducts(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((supplier) => {
        return {
          ...supplier,
          id: supplier._id,
          
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
  const createNewSupplierProduct = () => {
    
  };

  if (dataOptions == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>
        <Button variant="contained" color="primary" onClick={createNewSupplierProduct}>
          + New Supplier Product
        </Button>
      </Card>
      <DataTable
        rows={dataOptions.rows}
        columns={columns}
        auto_height
        listOptions={dataOptions.listOptions}
      ></DataTable>
    </>
  );
};

export default SupplierProductPage;