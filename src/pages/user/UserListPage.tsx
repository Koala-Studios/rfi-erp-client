import React from "react";
import { DataTable } from "../../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listUsers } from "../../logic/user.logic";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { Box, Button, Card, Typography } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FilterElement, IListData } from "../../logic/utils";
import DataFilter from "../../components/utils/DataFilter";

const UserListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    { label: "Email", field: "email", type: "text" },
    { label: "Username", field: "username", type: "text" },
    { label: "Roles", field: "roles", type: "dropdown", options: [{value: "idk", text: "Role_1"}, {value: "Rolling", text: "Role_2"}] },
  ];
  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "username", headerName: "Username", width: 250 },
    { field: "email", headerName: "email", width: 250 },
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
              navigate(`/users/${params.value}`, { replace: false })
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
    listUsers(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((user) => {
        return {
          id: user._id,
          username: user.username,
          email: user.email,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);
  const createNewUser = () => {
    navigate(`/users/new`, { replace: false });
  };

  if (dataOptions == null) return null;

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
      <DataFilter filters={filterArray}></DataFilter>
        <Button variant="contained" color="primary" onClick={createNewUser}>
          + New User
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

export default UserListPage;
