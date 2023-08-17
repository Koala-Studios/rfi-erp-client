import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listSuppliers } from "../../logic/supplier.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Button, Card, Rating } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";

const SupplierProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    { field: "product_code", headerName: "Product Code", width: 80 },
    { field: "supplier_sku", headerName: "Supplier SKU", width: 80 },
    { field: "name", headerName: "Product Name", width: 250 },
    {
      field: "cost",
      headerName: "Cost/KG",
      width: 200,
    },
    { field: "description", headerName: "Description", width: 200 },
    { field: "cas_number", headerName: "Cas Number", width: 200 },
  ];

  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    listSuppliers(searchParams, filterArray).then((list) => {
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
        listOptions={dataOptions.listOptions}
      ></DataTable>
    </>
  );
};

export default SupplierProductPage;
