import { Box, Card, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { listActivityLog } from "../../logic/activity-log.logic";
import { FilterElement, IListData } from "../../logic/utils";

const UserListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataOptions, setDataOptions] = React.useState<IListData | null>(null);
  const filterArray: FilterElement[] = [
    { label: "Email", field: "action", type: "text" },
    { label: "Module", field: "module", type: "text" },
  ];
  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 300 },
    { field: "action", headerName: "Username", width: 250 },
    { field: "module", headerName: "email", width: 250 },
  ];

  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    listActivityLog(searchParams, filterArray).then((list) => {
      const newRows = list!.docs.map((activity) => {
        return {
          id: activity._id,
          username: activity.user.username,
          action: activity.action,
          module: activity.module,
          item_title: activity.itemTitle,
          timestamp: activity.timestamp,
        };
      });
      setDataOptions({ rows: newRows, listOptions: list! });
    });
  }, [location.key]);

  if (dataOptions === null) return null;

  return (
    <Box
      sx={{ mt: 3 }}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      {dataOptions.rows.map((activity: any) => (
        <Card variant="outlined" sx={{ width: "50%", mb: 1.5, p: 1.5 }}>
          <Typography variant="body1">
            <strong>{activity.username}</strong> edited{" "}
            <strong>{activity.item_title}</strong>
          </Typography>
          <Typography variant="caption">
            Date:{activity.timestamp.toString()}
          </Typography>
        </Card>
      ))}
    </Box>
  );
};

export default UserListPage;
