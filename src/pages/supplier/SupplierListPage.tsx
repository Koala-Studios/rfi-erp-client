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

const SupplierListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    { label: "Name", field: "name", type: "text" },
    { label: "Code", field: "code", type: "text" },
    { label: "Created Date", field: "created_date", type: "date" },
    { label: "Contact Name", field: "contact_name", type: "text" },
    { label: "Email", field: "email", type: "text" },
    { label: "Phone", field: "phone", type: "text" },
  
  ];
  const columns: GridColDef[] = [
    { field: "code", headerName: "Code", width: 80 },
    { field: "name", headerName: "Supplier Name", width: 250 },
    {
      field: "contact_name",
      headerName: "Contact Name",
      width: 150,
    },
    { field: "address_one", headerName: "Address Line One", width: 200 },
    { field: "address_two", headerName: "Address Line Two", width: 200 },
    { field: "phone", headerName: "Phone Number", width: 170 },
    { field: "trust_factor", headerName: "Trust Rating", width: 120, align:'center',
    renderCell: (params: GridRenderCellParams<number>) => (
      <Rating
      name="half-rating"
      value={params.row.trust_factor}
      readOnly={true}
      precision={0.5}
    />
    ), },
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
        <DataFilter filters={filterArray}></DataFilter>
        <Button variant="contained" color="primary" onClick={createNewSupplier}>
          + New Supplier
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
