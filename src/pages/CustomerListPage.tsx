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
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../logic/utils";
import DataFilter from "../components/utils/DataFilter";

const CustomerListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    {
      label: "Product Code",
      field: "product_code",
      type: "text",
    },
    { label: "Batch Code", field: "batch_code", type: "text" },
    { label: "Quantity", field: "quantity", type: "number", regexOption: null },
  
  ];
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

  React.useEffect(() => {
    listCustomers(searchParams, filterArray).then((list) => {
      console.log(list);
      const newRows = list!.docs.map((customer) => {
        return {
          id: customer._id,
          code: customer.code,
          name: customer.name,
          // contact_name: customer.contact_name,
          // address_one: customer.address_one,
          // address_two: customer.address_two,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
  const createNewCustomer = () => {
    navigate(`/customers/new`, { replace: false });
  };

  if (dataOptions == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>
        <Button variant="contained" color="primary" onClick={createNewCustomer}>
          + New Customer
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

export default CustomerListPage;
