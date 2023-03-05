import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listProducts } from "../logic/product.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Button, Card, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IListData } from "../logic/utils";

const ProductStatus = [
  ["Pending", "error"],
  ["In Progress", "warning"],
  ["Awaiting Approval", "info"],
  ["Approved", "success"],
  ["Error", "error"],
];

const DvpListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "product_code", headerName: "Product Code", width: 200 },
    { field: "name", headerName: "Product Name", width: 300 },
    {
      field: "status",
      headerName: "Status",
      width: 200,
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
            onClick={() =>
              navigate(`/products/${params.value}`, { replace: false })
            }
          >
            View Details
          </Button>
          <Button
            variant="outlined"
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
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);

  React.useEffect(() => {
    listProducts(25, 1, false).then((list) => {
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
  }, []);

  if (dataOptions == null) return null;

  return (
    <>
      <DataTable
        rows={dataOptions.rows}
        columns={columns}
        listOptions={dataOptions.listOptions}
      ></DataTable>
    </>
  );
};

export default DvpListPage;
