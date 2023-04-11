import {
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../components/navigation/AuthProvider";
import {
  createProduct,
  getProduct,
  IProduct,
  updateProduct,
} from "../logic/product.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../components/forms/SaveForm";
import StandaloneAutocomplete from "../components/utils/StandaloneAutocomplete";
import { IProductType } from "../logic/product-type.logic";

const emptyProduct: IProduct = {
  _id: "",
  name: "",
  aliases:"",
  description: "",
  rating: null,
  product_code: "",
  is_raw_mat: false,
  for_sale: true,
  cost: 0,
  stock: {
    batch_code: "",
    on_hand: 0,
    in_transit: 0,
    on_order: 0,
    allocated: 0,
    on_hold: 0,
    quarantined: 0,
  },
  customers: [],
  regulatory: {
    fda_status: 0,
    cpl_hazard: "",
    fema_number: 0,
    ttb_status: "",
    eu_status: 0,
    organic: false,
    kosher: false,
  },
  versions: 0,
  status: 0,
  approved_version: 0,
  rec_dose_rate: 0,
  product_type: null,
};

let savedProduct: IProduct | null = null;

export const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = React.useContext(AuthContext);
  const [product, setProduct] = React.useState<IProduct | null>(null);
  const isNewId = id === "new";
  const [productSaved, setProductSaved] = React.useState<boolean>(true);

  const ProductStatus = [
    ["PENDING", "error"],
    ["IN PROGRESS", "warning"],
    ["AWAITING APPROVAL", "info"],
    ["APPROVED", "success"],
    ["DRAFT", "warning"],
  ];

  useEffect(() => {
    if (isNewId) {
      //new product, create new on save
      savedProduct = emptyProduct;
      setProduct(emptyProduct);
    } else {
      getProduct(id!).then((p) => {
        savedProduct = p;
        setProduct(p!);
        // setProductSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (product == null || productSaved === false) return;

    if (JSON.stringify(savedProduct) !== JSON.stringify(product)) {
      setProductSaved(false);
    }
  }, [product]);

  const saveProduct = async () => {
    //send new product to server
    if (id === "new") {
      createProduct(product!).then((_product) => {
        if (_product) {
          console.log(_product)
          navigate(`/products/${_product._id}`, { replace: true });
          savedProduct = _product;
          setProduct(_product);
          setProductSaved(true);
        } else {
          console.log("Product Not Saved");
        }
      })
    } else {
      const updated = await updateProduct(product!);

      if (updated === false) {
        throw Error("Update Product Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setProductSaved(true);
  };
  const cancelSaveProduct = () => {
    setProduct(savedProduct);
    setProductSaved(true);
  };

  if (product == null) return null;

  return (
    <>
      <SaveForm
        display={!productSaved}
        onSave={saveProduct}
        onCancel={cancelSaveProduct}
      ></SaveForm>
      <Card variant="outlined" style={{ padding: 16, marginBottom: 10 }}>
        <Button
          sx={{ mb: 3 }}
          aria-label="go back"
          size="medium"
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon fontSize="small" />
        </Button>
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                defaultValue={product.product_code}
                InputProps={{
                  readOnly: true,
                }}
                label={"Product Code"}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Product Name"}
                value={product.name}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={1}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"V#"}
                value={product.versions}
                InputProps={{
                  readOnly: true,
                }}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
              <Chip
                label={
                  ProductStatus[product?.status ? product.status - 1 : 4][0]
                }
                sx={{
                  width: "80%",
                  height: "80%",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
                //@ts-ignore
                color={
                  ProductStatus[product?.status ? product.status - 1 : 4][1]
                }
                variant="outlined"
              />
            </Grid>
            <Grid item xs={2} sx={{ "& > legend": { mt: -0.5 }, }} >
              <Typography component="legend">Rating</Typography>
              <Rating
                onChange={(e, value) => {
                  console.log(value);
                  setProduct({ ...product, rating: value });
                }}
                name="half-rating"
                value={product.rating}
                precision={0.5}
              />
            </Grid>

            <Grid item xs={2}>
              <StandaloneAutocomplete
                initialValue={product.product_type}
                readOnly={!isNewId}
                onChange={(e, value) => {
                  setProduct({ ...product, product_type: value });
                }}
                label={"Product Type"}
                letterMin={0}
                dbOption={"product-type"}
                getOptionLabel={(item: IProductType) =>
                  item.code + " | " + item.name
                }
              />
            </Grid>

            <Grid item xs={6} >
            <TextField
                onChange={(e) =>
                  setProduct({ ...product, aliases: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Product Aliases"}
                value={product.aliases}
                multiline
                rows={2}
              ></TextField>
            </Grid>

            <Grid item xs={2}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Created Date"}
                InputProps={{
                  readOnly: !isNewId,
                }}
                type={"date"}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Approved Date"}
                InputProps={{
                  readOnly: true,
                }}
                type={"date"}
              ></TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Flavor Profile"}
                value={product.description}
                multiline
                rows={6}
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
