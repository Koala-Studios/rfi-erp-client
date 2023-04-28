import {
  Card,
  Button,
  Grid,
  TextField,
  Chip,
  Typography,
  Checkbox,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { getProduct } from "../../logic/product.logic";
import {
  createProductType,
  getProductType,
  IProductType,
  updateProductType,
} from "../../logic/product-type.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../../components/forms/SaveForm";

const emptyProductType: IProductType = {
  _id: "",
  name: "",
  code: "",
  is_raw: true,
  avoid_recur: false,
  for_sale: false,
  total: 0,
};

let savedProductType: IProductType | null = null;

export const ProductTypeDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [productType, setProductType] = useState<IProductType | null>(null);
  const [productTypeSaved, setProductTypeSaved] = useState<boolean>(true);

  useEffect(() => {
    if (id === "new") {
      //new ProductType, create new on save
      savedProductType = emptyProductType;
      setProductType(emptyProductType);
    } else {
      getProductType(id!).then((p) => {
        savedProductType = p;
        setProductType(p!);
        // setProductTypeSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (productType == null || productTypeSaved === false) return;

    if (JSON.stringify(savedProductType) !== JSON.stringify(productType)) {
      console.log(
        JSON.stringify(savedProductType),
        JSON.stringify(productType),
        "test"
      );
      setProductTypeSaved(false);
    }
  }, [productType]);

  const saveProductType = async () => {
    // send new productType to server
    if (id === "new") {
      const newProductTypeId = await createProductType(productType!);

      if (newProductTypeId) {
        navigate(`/product-types/${newProductTypeId}`, { replace: true });
        setProductType({ ...productType!, _id: newProductTypeId });
      }
    } else {
      const updated = await updateProductType(productType!);

      if (updated === false) {
        throw Error("Update Project Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setProductTypeSaved(true);
  };
  const cancelSaveProductType = () => {
    setProductType(savedProductType);
    setProductTypeSaved(true);
  };

  if (productType == null) return null;

  return (
    <>
      <SaveForm
        display={!productTypeSaved}
        onSave={saveProductType}
        onCancel={cancelSaveProductType}
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
          Back to Product Types
        </Button>
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={1}>
              <TextField
                onChange={(e) => {
                  setProductType({ ...productType, code: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                inputProps={{ maxLength: 2 }}
                size="small"
                variant="outlined"
                value={productType.code}
                label={"Code"}
              ></TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                onChange={(e) => {
                  setProductType({ ...productType, name: e.target.value });
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Name"}
                value={productType.name}
                InputProps={{}}
              ></TextField>
            </Grid>

            <Grid item xs={2}>
              <label>
                Is Raw
                <Checkbox
                  checked={productType.is_raw}
                  // onChange={}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </label>
            </Grid>

            <Grid item xs={2}>
              <label>
                For Sale
                <Checkbox
                  checked={productType.for_sale}
                  // onChange={}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </label>
            </Grid>
          



            <Grid item xs={2.5}>
              <label>
                Avoid Recursion
                <Checkbox
                  checked={productType.avoid_recur}
                  // onChange={}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </label>
            </Grid>
          </Grid>


          <Card
            variant="outlined"
            style={{ width: "30%", minWidth: "30%", padding: 16 }}
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
