import {
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Rating,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import {
  createProduct,
  getProduct,
  IProduct,
  updateProduct,
} from "../../logic/product.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../../components/forms/SaveForm";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import { IProductType } from "../../logic/product-type.logic";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import LinkTab from "../../components/utils/LinkTab";
import NavTab from "../../components/utils/NavTab";
import InventoryMovementPage from "../inventory/InventoryMovementPage";


const ProductStatus = [
  ["PENDING", "error"],
  ["IN PROGRESS", "warning"],
  ["AWAITING APPROVAL", "info"],
  ["APPROVED", "success"],
  ["DRAFT", "warning"],
];

const emptyProduct: IProduct = {
  _id: "",
  name: "",
  aliases:"",
  description: "",
  rating: null,
  product_code: "",
  is_raw: false,
  is_solid: true,
  date_created: new Date().toISOString().split('T')[0],
  for_sale: true,
  cost: 0,
  stock: {
    on_hand: 0,
    in_transit: 0,
    ordered: 0,
    allocated: 0,
    on_hold: 0,
    quarantined: 0,
  },
  regulatory: { //TODO: ADD OTHER FIELDS HERE!!
    fda_status: 0,
    cpl_hazard: "",
    fema_number: 0,
    ttb_status: "",
    eu_status: 0,
  },
  dietary: {
    vegan: false,
    organic: false,
    kosher: true,
    halal: false,
    vegetarian: false,
  },
  versions: 0,
  status: 1,
  approved_version: 0,
  rec_dose_rate: 0,
  product_type: null,
};

let savedProduct: IProduct | null = null;



const inputRefMap = {
  name: 0,
  date_created:1,
  // product_code: 2,

};

const inputMap: InputInfo[] = [
  { label: "name", ref: 0, validation: { required: true, genericVal: "Text" } },
  {
    label: "date_created",
    ref: 1,
    validation: { required: true, genericVal: "Date" },
  },
  { label: "product_type", ref: 2, validation: { required: true, genericVal: "Text" } },
];


export const ProductDetailPage = () => {
  const { id,tab_id } = useParams();
  const navigate = useNavigate();
  const p_type_var = tab_id === 'material' ? "product-type-mat" : "product-type";
  const auth = React.useContext(AuthContext);
  const [product, setProduct] = React.useState<IProduct | null>(null);
  const isNewId = id === "new";
  const [productSaved, setProductSaved] = React.useState<boolean>(true);

  const inputRefs = React.useRef<any[]>([]);
  const [inputVisuals, setInputVisuals] = React.useState<InputVisual[]>(
    Array(inputMap.length).fill({ helperText: "", error: false })
  );

  const onInputBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    input: InputInfo
  ) => {
    const _input = inputRefs.current[input.ref];

    const inputVal = isValid(_input.value, inputMap[input.ref].validation);
    inputVisuals[input.ref] = {
      helperText: inputVal.msg,
      error: !inputVal.valid,
    };

    setInputVisuals({ ...inputVisuals });

    const label = inputMap[input.ref].label;
    //@ts-ignore
    product[label] = event.target.value;

    setProduct({ ...product! });
    setProductSaved(false);
  };


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
    
    let allValid = true;
    //do client side validation
    for (let i = 0; i < inputRefs.current.length; i++) {
      const _input = inputRefs.current[i];

      const inputVal = isValid(_input.value, inputMap[i].validation);
      inputVisuals[i] = {
        helperText: inputVal.msg,
        error: !inputVal.valid,
      };

      if (inputVal.valid === false) {
        allValid = false;
      }
    }

    setInputVisuals({ ...inputVisuals });

    if (allValid === false) {
      window.dispatchEvent(
        new CustomEvent("NotificationEvent", {
          detail: {
            text: "Changes Not Saved. Some inputs are invalid",
            color: "error",
          },
        })
      );
      return;
    }

    //send new product to server
    if (id === "new") {
      createProduct(product!).then((_product) => {
        if (_product) {
          console.log(_product)
          navigate(`/products/${_product._id}`, { replace: true });
          savedProduct = _product;
          setProduct(_product); //THIS IS NOT WORKING ...
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
        <div style={{ display: "flex", gap: 16, marginBottom: 10, maxWidth:'80%' }}>
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
                defaultValue={product.name}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.name] = el)
                }
                error={inputVisuals[inputRefMap.name].error}
                helperText={inputVisuals[inputRefMap.name].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.name])
                }
                required={
                  inputMap[inputRefMap.name].validation.required
                }
                
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Product Name"}
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
              <Chip
                label={
                  ProductStatus[product?.status ? product.status - 1 : 4][0]
                }
                sx={{
                  width: "80%",
                  height: "80%",
                  maxHeight:40,
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

            <Grid item xs={4} >
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
              <StandaloneAutocomplete
                initialValue={product.product_type}
                readOnly={!isNewId}
                onChange={(e, value) => {
                  setProduct({ ...product, product_type: value });
                }}
                label={"Product Type"}
                letterMin={0}
                dbOption={p_type_var}
                getOptionLabel={(item: IProductType) =>
                  item.code + " | " + item.name
                }
              />
            </Grid>
            <Grid item xs={1}/>
            <Grid item xs={1}>
              <TextField
                value={product.cost.toFixed(2)}
                InputProps={{
                  readOnly: true,
                }}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Cost"}
                type="number">
              </TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                defaultValue={product!.date_created ? product.date_created.split('T')[0] : null}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.date_created] = el)
                }
                error={inputVisuals[inputRefMap.date_created].error}
                helperText={inputVisuals[inputRefMap.date_created].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.date_created])
                }
                required={
                  inputMap[inputRefMap.date_created].validation.required
                }
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
        </div>
      </Card>
      <NavTab>
        <LinkTab label="Formula" href= "formula" tab_id={tab_id} disable={id === 'new'}/>
        
        <LinkTab label="Customers" href="customers" tab_id={tab_id} disable={id === 'new'} />
        <LinkTab label="Movements" href= "movements" tab_id={tab_id} disable={id === 'new'}/>
        <LinkTab label="Usage Stats" href="stats" tab_id={tab_id} disable={id === 'new'} />
      </NavTab>
      {
          (tab_id && tab_id === "movements" && 
            <InventoryMovementPage/>)
      }
    </>
  ); 
};
