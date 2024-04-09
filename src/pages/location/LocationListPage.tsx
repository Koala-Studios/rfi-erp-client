import { Box, Button, Card } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import DataFilter from "../../components/utils/DataFilter";
import { DataTable } from "../../components/utils/DataTable";
import { listLocations } from "../../logic/location.logic";
import { FilterElement, IListData } from "../../logic/utils";

const LocationListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    {
      label: "Code",
      field: "code",
      type: "text",
    },
    { label: "Name", field: "name", type: "text" },
  ];
  const columns: GridColDef[] = [
    { field: "code", headerName: "Code", width: 150 },
    { field: "name", headerName: "Name", width: 250 },
    { field: "description", headerName: "Description", width: 350 },
    { field: "total_containers", headerName: "# Containers", width: 120 },
    {
      field: "created_date",
      headerName: "Created Date",
      width: 150,
      valueGetter: (params) => params.row.created_date.split("T")[0],
    },
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
              navigate(`/locations/${params.value}`, { replace: false })
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
    listLocations(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((location) => {
        return {
          id: location._id,
          code: location.code,
          name: location.name,
          total_containers: location.total_containers,
          created_date: location.created_date,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
  const createNewLocation = () => {
    navigate(`/locations/new`, { replace: false });
  };

  if (dataOptions === null) return null;

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <DataFilter filters={filterArray}></DataFilter>
        <Button variant="contained" color="primary" onClick={createNewLocation}>
          + New Location
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

export default LocationListPage;
