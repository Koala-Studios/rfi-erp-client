import VisibilityIcon from "@mui/icons-material/Visibility";
import { Button, Card, Chip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import DataFilter from "../../components/utils/DataFilter";
import { DataTable } from "../../components/utils/DataTable";
import { listQualityControl } from "../../logic/quality-control.logic";
import { FilterElement, IListData } from "../../logic/utils";
const QualityControlListPage = () => {
  const orderStatus = [
    ["PENDING", "warning"],
    ["FAILED", "error"],
    ["APPROVED", "success"],
    ["ERROR", "info"],
  ];
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
    { label: "Product Name", field: "product_name", type: "text" },
    { label: "Lot Number", field: "lot_number", type: "text" },
    { label: "Request Source", field: "request_source", type: "text" },
    { label: "Request Type", field: "request_type", type: "text" },
    { label: "Created Date", field: "created_date", type: "date" },
    { label: "Completed Date", field: "completed_date", type: "text" },
  ];
  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "product_code", headerName: "Product Code", width: 120 },
    { headerName: "Lot Number", field: "lot_number", type: "text", width: 120 },
    { field: "product_name", headerName: "Product Name", width: 300 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      align: "center",
      renderCell: (params: GridRenderCellParams<number>) => (
        <Chip
          label={orderStatus[params.value ?? 3][0]}
          sx={{
            fontWeight: 600,
          }}
          //@ts-ignore
          color={orderStatus[params.value ?? 3][1]}
          variant="outlined"
        />
      ),
    },
    { field: "request_type", headerName: "Type", width: 120, align: "right" },
    {
      field: "created_date",
      headerName: "Created Date",
      width: 100,
      align: "right",
    },
    {
      field: "completed_date",
      headerName: "Complete Date",
      width: 120,
      align: "right",
    },
    {
      field: "request_source",
      headerName: "Src",
      width: 35,
      align: "center",
      renderCell: (params: GridRenderCellParams<Date>) => (
        <strong>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ borderRadius: 12 }}
            onClick={
              () => navigate(`/products/${params.value}`, { replace: false }) //TODO: make this work properly lol.
            }
          >
            <VisibilityIcon></VisibilityIcon>
          </Button>
        </strong>
      ),
    },
    {
      field: "id",
      headerName: "Actions",
      align: "left",
      width: 160,
      renderCell: (params: GridRenderCellParams<Date>) => (
        <strong>
          <Button
            style={{ marginRight: 15 }}
            variant="contained"
            color="success"
            size="small"
            onClick={() => navigate(`/qc/${params.value}`, { replace: false })}
          >
            PASS
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => navigate(`/qc/${params.value}`, { replace: false })}
          >
            FAIL
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    listQualityControl(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((product) => {
        return {
          id: product._id,
          ...product,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
  if (dataOptions === null) return null;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ mb: 2, p: 2, border: "1px solid #c9c9c9" }}
      >
        <DataFilter filters={filterArray}></DataFilter>
        {/* <Button variant="contained" color="primary" onClick={createNewProduct}>
          + New Product
        </Button> */}
        <DataTable
          rows={dataOptions.rows}
          columns={columns}
          auto_height={true}
          listOptions={dataOptions.listOptions}
        ></DataTable>
      </Card>
    </>
  );
};

export default QualityControlListPage;
