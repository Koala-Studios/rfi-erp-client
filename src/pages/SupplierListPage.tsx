import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listSuppliers } from "../logic/supplier.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SupplierListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "name", headerName: "Supplier Name", width: 250 },
    { field: "code", headerName: "Supplier Code", width: 200 },
    {
      field: "contact_name",
      headerName: "Contact Name",
      width: 200,
    },
    { field: "address_one", headerName: "Address Line One", width: 200 },
    { field: "address_two", headerName: "Address Line Two", width: 200 },
    { field: "phone", headerName: "Phone Number", width: 200 },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 250,
      renderCell: (params: GridRenderCellParams<Date>) => (
        <strong>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() =>
              navigate(`/suppliers/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listSuppliers(auth.token, 25, 1).then((supplierList) => {
      const newRows = supplierList.map((supplier) => { 
        return {
          id: supplier._id,
          code: supplier.code,
          name: supplier.name,
          contact_name: supplier.contact_name,
          address_one: supplier.address_one,
          address_two: supplier.address_two
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return <DataTable rows={rows!} columns={columns}></DataTable>;
};

export default SupplierListPage;
