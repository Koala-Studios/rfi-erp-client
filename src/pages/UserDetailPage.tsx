import { Card, Button, Grid, TextField, Chip, Typography } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getProduct } from "../logic/product.logic";
import { createUser, getUser, IUser, updateUser } from "../logic/user.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../components/forms/SaveForm";

const emptyUser: IUser = {
  _id: "",
  username: "",
  email: "",
  user_code: "",
  created_date: "",
};

let savedUser: IUser | null = null;

export const UserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [user, setUser] = useState<IUser | null>(null);
  const [userSaved, setUserSaved] = useState<boolean>(true);

  useEffect(() => {
    if (id === "new") {
      //new User, create new on save
      savedUser = emptyUser;
      setUser(emptyUser);
    } else {
      getUser(id!).then((p) => {
        savedUser = p;
        setUser(p!);
        // setUserSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (user == null || userSaved === false) return;

    if (JSON.stringify(savedUser) !== JSON.stringify(user)) {
      console.log(JSON.stringify(savedUser), JSON.stringify(user), "test");
      setUserSaved(false);
    }
  }, [user]);

  const saveUser = async () => {
    // send new user to server
    if (id === "new") {
      const newUserId = await createUser(user!);

      if (newUserId) {
        navigate(`/users/${newUserId}`, { replace: true });
        setUser({ ...user!, _id: newUserId });
      }
    } else {
      const updated = await updateUser(user!);

      if (updated === false) {
        throw Error("Update Project Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setUserSaved(true);
  };
  const cancelSaveUser = () => {
    setUser(savedUser);
    setUserSaved(true);
  };

  if (user == null) return null;

  return (
    <>
      <SaveForm
        display={!userSaved}
        onSave={saveUser}
        onCancel={cancelSaveUser}
      ></SaveForm>
      <Card variant="outlined" style={{ padding: 16, marginBottom: 10 }}>
        <Button
          sx={{ mb: 3 }}
          aria-label="go back"
          size="medium"
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon
            fontSize="small"
            sx={{
              marginRight: 1,
            }}
          />
          Back to Users
        </Button>
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <TextField
                onChange={(e) => {
                  setUser({ ...user, email: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                size="small"
                variant="outlined"
                label={"Email"}
                defaultValue={user.email}
                InputProps={{}}
              ></TextField>
            </Grid>

            <Grid item xs={3}>
              <TextField
                onChange={(e) => {
                  setUser({ ...user, username: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"User Name"}
                value={user.username}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={6}></Grid>

            <Grid item xs={3}>
              <TextField
                onChange={(e) =>
                  setUser({ ...user, created_date: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Created Date"}
                type={"date"}
                value={user.created_date}
              ></TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                onChange={(e) => {
                  setUser({ ...user, user_code: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                value={user.user_code}
                label={"User Code"}
              ></TextField>
            </Grid>
          </Grid>

          <Card
            variant="outlined"
            style={{ width: "40%", minWidth: "40%", padding: 16 }}
          >
            <div>
              <Typography variant="h6">Overview Stats</Typography>
            </div>
          </Card>
        </div>
      </Card>
    </>
  );
};
