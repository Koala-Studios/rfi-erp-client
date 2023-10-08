import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listProducts } from "../../logic/product.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";

const ProductStatus = [
  ["Pending", "error"],
  ["In Progress", "warning"],
  ["Awaiting Approval", "info"],
  ["Approved", "success"],
  ["Error", "error"],
];
//label,field,type
const filterArray: FilterElement[] = [
  {
    label: "Product Code",
    field: "product_code",
    type: "text",
  },
  { label: "Product Name", field: "name", type: "text"},
  { label: "Product Alias", field: "aliases", type: "text"},
  { label: "Regulatory", field: "regulatory", type: "text"}, // Look at regulatory obj
  { label: "Dietary", field: "dietary", type: "text"},
  { label: "Product Type", field: "product_type", type: "text"},
  { label: "Date Created", field: "date_created", type: "date"},
  { label: "Solid", field: "is_solid", type: "text"},
  { label: "Quantity", field: "quantity", type: "number", regexOption: null },

];
const FormulaListPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 200 },
    { field: "name", headerName: "Product Name", width: 300 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      align: 'center',
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={ProductStatus[params.value ? params.value - 1 : 4][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={ProductStatus[params.value ? params.value - 1 : 4][1]}
          variant="outlined"
        />
      ),
    },
    {
      field: "versions",
      headerName: "Latest V#",
      width: 80,
      align: "right",
    },
    {
      field: "created_date",
      headerName: "Created Date",
      width: 120,
      align: "right",
      valueGetter: (params) => params.row.created_date ? params.row.created_date : ''
    },
    {
      field: "latest_update",
      headerName: "Latest Update",
      width: 120,
      align: "right",
      valueGetter: (params) => params.row.latest_update ? params.row.latest_update : ''
    },
    { field: "cost", headerName: "Cost", width: 100, align: "right" },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 250,
      renderCell: (params: GridRenderCellParams<string>) => (
        <strong>
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() =>
              navigate(
                `/formula/develop/${params.value}/${params.row.versions}`,
                {
                  //TODO: TEMPORARY FOR DEVELOPMENT
                  // navigate(`/formula/${params.value}/${params.row.versions}`, {
                  replace: false,
                }
              )
            }
          >
            Formula
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    listProducts(searchParams, filterArray, false).then((list) => {
      const newRows = list!.docs.map((product) => {
        return {
          id: product._id,
          product_code: product.product_code,
          name: product.name,
          status: product.status,
          versions: product.versions,
          approved_version: product.approved_version,
          cost: product.cost,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);

  const createNewProduct = () => {
    navigate(`/products/new`, { replace: false });
  };

  if (dataOptions == null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>

        <Button variant="contained" color="primary" onClick={createNewProduct}>
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

export default FormulaListPage;
