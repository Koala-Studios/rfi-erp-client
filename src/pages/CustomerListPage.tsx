import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listCustomers } from "../logic/customer.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Card } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CustomerListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "name", headerName: "Customer Name", width: 250 },
    { field: "code", headerName: "Customer Code", width: 200 },
    // {
    //   field: "contact_name",
    //   headerName: "Contact Name",
    //   width: 200,
    // },
    // { field: "address_one", headerName: "Address Line One", width: 200 },
    // { field: "address_two", headerName: "Address Line Two", width: 200 },
    // { field: "phone", headerName: "Phone Number", width: 200 },
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
              navigate(`/customers/${params.value}`, { replace: false })
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
    listCustomers(auth.token, 25, 1).then((customerList) => {
      console.log(customerList);
      const newRows = customerList.map((customer) => {
        return {
          id: customer._id,
          code: customer.code,
          name: customer.name,
          // contact_name: customer.contact_name,
          // address_one: customer.address_one,
          // address_two: customer.address_two,
        };
      });
      setRows(newRows);
    });
  }, []);
  const createNewCustomer = () => {
    navigate(`/customers/new`, { replace: false });
  };



  if (rows == null) return null;

  return (
    <>
    <Card
    variant="outlined"
    sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
  >
    <Button variant="contained" color="primary" onClick={createNewCustomer}>
      + New Product
    </Button>
  </Card>
    <DataTable
      rows={rows!}
      columns={columns}
      listOptions={undefined}
    ></DataTable>
    </>
  );
};

export default CustomerListPage;
