import { Card, Button, Grid, TextField, Chip, Typography } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import { getProduct } from "../logic/product.logic";
import {
  createSupplier,
  getSupplier,
  ISupplier,
  updateSupplier,
} from "../logic/supplier.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../components/forms/SaveForm";

const emptySupplier: ISupplier = {
  _id: "new",
  name: "",
  contact_name: "",
  email: "",
  address_one: "",
  address_two: "",
  code: "",
  phone: "",
};

let savedSupplier: ISupplier | null = null;

export const SupplierDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [supplier, setSupplier] = useState<ISupplier | null>(null);
  const [supplierSaved, setSupplierSaved] = useState<boolean>(true);

  useEffect(() => {
    if (id === "new") {
      //new Supplier, create new on save
      savedSupplier = emptySupplier;
      setSupplier(emptySupplier);
    } else {
      getSupplier(id!).then((p) => {
        savedSupplier = p;
        setSupplier(p!);
        // setSupplierSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (supplier == null || supplierSaved === false) return;

    if (JSON.stringify(savedSupplier) !== JSON.stringify(supplier)) {
      setSupplierSaved(false);
    }
  }, [supplier]);

  const saveSupplier = async () => {
    // send new project to server
    if (id === "new") {
      const newSupplierId = await createSupplier(supplier!);

      if (newSupplierId) {
        navigate(`/suppliers/${newSupplierId}`, { replace: true });
        setSupplier({ ...supplier!, _id: newSupplierId });
      }
    } else {
      const updated = await updateSupplier(supplier!);

      if (updated === false) {
        throw Error("Update Supplier Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setSupplierSaved(true);
  };
  const cancelSaveSupplier = () => {
    setSupplier(savedSupplier);
    setSupplierSaved(true);
  };

  if (supplier == null) return null;

  return (
    <>
      <SaveForm
        display={!supplierSaved}
        onSave={saveSupplier}
        onCancel={cancelSaveSupplier}
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
          Back to Suppliers
        </Button>
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                onChange={(e) =>
                  setSupplier({ ...supplier, createdAt: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Created Date"}
                type={"date"}
                value={supplier.createdAt}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                onChange={(e) => {
                  setSupplier({ ...supplier, code: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                value={supplier.code}
                label={"Supplier Code"}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setSupplier({ ...supplier, name: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Supplier Name"}
                value={supplier.name}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setSupplier({ ...supplier, contact_name: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Contact Name"}
                value={supplier.contact_name}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setSupplier({ ...supplier, email: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Contact Email"}
                value={supplier.email}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setSupplier({ ...supplier, phone: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Contact Phone"}
                value={supplier.phone}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setSupplier({ ...supplier, address_one: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Address One"}
                value={supplier.address_one}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) => {
                  setSupplier({ ...supplier, address_two: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Address Two"}
                value={supplier.address_two}
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
