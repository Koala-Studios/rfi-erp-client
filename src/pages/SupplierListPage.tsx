import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listSuppliers } from "../logic/supplier.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Card } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IListData } from "../logic/utils";

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
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  React.useEffect(() => {
    listSuppliers(auth.token, 25, 1).then((list) => {
      const newRows = list!.docs.map((supplier) => {
        return {
          id: supplier._id,
          code: supplier.code,
          name: supplier.name,
          contact_name: supplier.contact_name,
          address_one: supplier.address_one,
          address_two: supplier.address_two,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, []);
  const createNewSupplier = () => {
    navigate(`/suppliers/new`, { replace: false });
  };

  if (dataOptions == null) return null;
  
  return (
    <>
    <Card
    variant="outlined"
    sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
  >
    <Button variant="contained" color="primary" onClick={createNewSupplier}>
      + New Product
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

export default SupplierListPage;
