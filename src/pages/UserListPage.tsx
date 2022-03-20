import React from "react";
import { DataTable } from "../components/utils/DataTable";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { listUsers } from "../logic/user.logic";
import { AuthContext } from "../components/navigation/AuthProvider";
import { Box, Button, Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UserListPage = () => {
  const navigate = useNavigate();

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
            // onClick={() =>
            //   navigate(`/users/${params.value}`, { replace: false })
            // }
          >
            View Details
          </Button>
        </strong>
      ),
    },
  ];

  const auth = React.useContext(AuthContext);
  const [rows, setRows] = React.useState<any>(null);

  React.useEffect(() => {
    listUsers(auth.token, 25, 1).then((userList) => {
      const newRows = userList.map((user) => {
        return {
          id: user._id,
          username: user.username,
          email: user.email,
        };
      });
      setRows(newRows);
    });
  }, []);

  if (rows == null) return null;

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
        <Button variant="contained" color="primary">
          + New User
        </Button>
      </Card>
      <DataTable rows={rows!} columns={columns}></DataTable>;
    </Box>
  );
};

export default UserListPage;
