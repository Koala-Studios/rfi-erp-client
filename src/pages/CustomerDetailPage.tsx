import { Card, Button, Grid, TextField, Chip, Typography } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getProduct } from "../logic/product.logic";
import {
  createCustomer,
  getCustomer,
  ICustomer,
  updateCustomer,
} from "../logic/customer.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../components/forms/SaveForm";

const emptyCustomer: ICustomer = {
  _id: "new",
  name: "",
  contact_name: "",
  email: "",
  address_one: "",
  address_two: "",
  code: "",
  phone: "",
};

let savedCustomer: ICustomer | null = null;

export const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [customerSaved, setCustomerSaved] = useState<boolean>(true);

  useEffect(() => {
    if (id === "new") {
      //new Customer, create new on save
      savedCustomer = emptyCustomer;
      setCustomer(emptyCustomer);
    } else {
      getCustomer(auth.token, id!).then((p) => {
        savedCustomer = p;
        setCustomer(p!);
        // setCustomerSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (customer == null || customerSaved === false) return;

    if (JSON.stringify(savedCustomer) !== JSON.stringify(customer)) {
      setCustomerSaved(false);
    }
  }, [customer]);

  const saveCustomer = async () => {
    // send new project to server
    if (id === "new") {
      const newCustomerId = await createCustomer(auth.token, customer!);

      if (newCustomerId) {
        navigate(`/customers/${newCustomerId}`, { replace: true });
        setCustomer({ ...customer!, _id: newCustomerId });
      }
    } else {
      const updated = await updateCustomer(auth.token, customer!);

      if (updated === false) {
        throw Error("Update Customer Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setCustomerSaved(true);
  };
  const cancelSaveCustomer = () => {
    setCustomer(savedCustomer);
    setCustomerSaved(true);
  };

  if (customer == null) return null;

  return (
    <>
      <SaveForm
        display={!customerSaved}
        onSave={saveCustomer}
        onCancel={cancelSaveCustomer}
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
          Back to Customers
        </Button>
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                onChange={(e) =>
                  setCustomer({ ...customer, createdAt: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Created Date"}
                type={"date"}
                value={customer.createdAt}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                onChange={(e) => {
                  setCustomer({ ...customer, code: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                value={customer.code}
                label={"Customer Code"}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setCustomer({ ...customer, name: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Customer Name"}
                value={customer.name}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setCustomer({ ...customer, contact_name: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Contact Name"}
                value={customer.contact_name}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setCustomer({ ...customer, email: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Contact Email"}
                value={customer.email}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setCustomer({ ...customer, phone: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Contact Phone"}
                value={customer.phone}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setCustomer({ ...customer, address_one: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Address One"}
                value={customer.address_one}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setCustomer({ ...customer, address_two: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Address Two"}
                value={customer.address_two}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}></Grid>
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
