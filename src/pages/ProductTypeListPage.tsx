import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listProductTypes } from "../logic/product-type.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Box, Button, Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IListData } from "../logic/utils";

const ProductTypeListPage = () => {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "code", headerName: "Code", width: 75,  },
    { field: "name", headerName: "Name", width: 250 },
    { field: "is_raw", headerName: "Is Raw", width: 250 },
    { field: "for_sale", headerName: "For Sale", width: 250 },
    { field: "avoid_recur", headerName: "Avoid Recursion", width: 250 },
    { field: "total", headerName: "Total", width: 125 },
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
              navigate(`/product-types/${params.value}`, { replace: false })
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
    listProductTypes(25, 1).then((list) => {
      const newRows = list!.docs.map((productType) => {
        return {
          id: productType._id,
          ...productType
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, []);
  const createNewProductType = () => {
    navigate(`/product-types/new`, { replace: false });
  };

  if (dataOptions == null) return null;

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <Button variant="contained" color="primary" onClick={createNewProductType}>
          + Product Type
        </Button>
      </Card>
      <DataTable
        auto_height={true}
        rows={dataOptions.rows!}
        columns={columns}
        listOptions={dataOptions.listOptions}
      ></DataTable>
    </Box>
  );
};

export default ProductTypeListPage;
