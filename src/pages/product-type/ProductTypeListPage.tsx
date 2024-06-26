import { Box, Button, Card } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import DataFilter from "../../components/utils/DataFilter";
import { DataTable } from "../../components/utils/DataTable";
import { listProductTypes } from "../../logic/product-type.logic";
import { FilterElement, IListData } from "../../logic/utils";

const ProductTypeListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    { label: "Code", field: "code", type: "text" },
    { label: "Name", field: "name", type: "text" },
  ];
  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "code", headerName: "Code", width: 75 },
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

  React.useEffect(() => {
    listProductTypes(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((productType) => {
        return {
          id: productType._id,
          ...productType,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
  const createNewProductType = () => {
    navigate(`/product-types/new`, { replace: false });
  };

  if (dataOptions === null) return null;

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <DataFilter filters={filterArray}></DataFilter>
        <Button
          variant="contained"
          color="primary"
          onClick={createNewProductType}
        >
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
