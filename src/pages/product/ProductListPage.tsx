import { Button, Card } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import DataFilter from "../../components/utils/DataFilter";
import { DataTable } from "../../components/utils/DataTable";
import { listProducts } from "../../logic/product.logic";
import { FilterElement, IListData } from "../../logic/utils";

const ProductListPage = () => {
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
    { label: "Product Name", field: "name", type: "text" },
    { label: "Product Alias", field: "aliases", type: "text" },
    { label: "Regulatory", field: "regulatory", type: "text" }, // Look at regulatory obj
    { label: "Dietary", field: "dietary", type: "text" },
    { label: "Product Type", field: "product_type", type: "text" },
    { label: "Date Created", field: "date_created", type: "date" },
    { label: "Solid", field: "is_solid", type: "text" },
    { label: "Quantity", field: "quantity", type: "number", regexOption: null },
  ];
  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "product_code", headerName: "Product Code", width: 120 },
    { field: "name", headerName: "Product Name", width: 300 },
    {
      field: "approved_version",
      headerName: "Appr Version",
      width: 100,
      align: "center",
    },
    { field: "cost", headerName: "Cost/KG", width: 100, align: "right" },
    { field: "on_hand", headerName: "On Hand", width: 100, align: "right" },
    { field: "ordered", headerName: "Ordered", width: 100, align: "right" },
    {
      field: "quarantined",
      headerName: "Quarantined",
      width: 100,
      align: "right",
    },
    { field: "allocated", headerName: "Allocated", width: 100, align: "right" },
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
              navigate(`/products/${params.value}`, { replace: false })
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
    listProducts(searchParams, filterArray, true, true).then((list) => {
      const newRows = list!.docs.map((product) => {
        return {
          id: product._id,
          product_code: product.product_code,
          name: product.name,
          approved_version: product.approved_version,
          cost: `$${product.cost.toFixed(2)}`,
          on_hand: product.on_hand ? product.on_hand : 0,
          ordered: product.ordered ? product.ordered : 0,
          quarantined: product.quarantined ? product.quarantined : 0,
          allocated: product.allocated ? product.allocated : 0,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
  const createNewProduct = () => {
    navigate(`/products/new`, { replace: false });
  };

  if (dataOptions === null) return null;

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

export default ProductListPage;
