import { Card, Button, Grid, TextField, Chip, Typography, Rating } from "@mui/material";
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { getProduct } from "../../logic/product.logic";
import {
  createSupplier,
  getSupplier,
  ISupplier,
  updateSupplier,
} from "../../logic/supplier.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../../components/forms/SaveForm";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import SupplierProductPage from "./SupplierProductPage";
import LinkTab from "../../components/utils/LinkTab";
import NavTab from "../../components/utils/NavTab";

const emptySupplier: ISupplier = {
  _id: "new",
  code: "",
  name: "",
  contact_name: "",
  email: "",
  address_one: "",
  address_two: "",
  trust_factor:null,
  notes:"",
  phone: "",
  created_date: new Date().toISOString().split('T')[0]
};



let savedSupplier: ISupplier | null = null;

const inputRefMap = {
  code: 0,
  name: 1,
  created_date: 2,
};

const inputMap: InputInfo[] = [
  { label: "code", ref: 0, validation: { required: true, genericVal: "Text" } },
  {
    label: "name",
    ref: 1,
    validation: { required: true, genericVal: "Text" },
  },
  {
    label: "created_date",
    ref: 2,
    validation: { required: true, genericVal: "Text" },
  },
];

export const SupplierDetailPage = () => {
  const navigate = useNavigate();
  const { id,tab_id } = useParams();
  const auth = useContext(AuthContext);
  const [supplier, setSupplier] = useState<ISupplier | null>(null);
  const [supplierSaved, setSupplierSaved] = useState<boolean>(true);

  const inputRefs = useRef<any[]>([]);
  const [inputVisuals, setInputVisuals] = useState<InputVisual[]>(
    Array(inputMap.length).fill({ helperText: "", error: false })
  );

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
    supplier[label] = event.target.value;

    setSupplier({ ...supplier! });
    setSupplierSaved(false);
  };

  const saveSupplier = async () => {
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
                defaultValue={supplier.code}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.code] = el)
                }
                error={inputVisuals[inputRefMap.code].error}
                helperText={inputVisuals[inputRefMap.code].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.code])
                }
                required={inputMap[inputRefMap.code].validation.required}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Supplier Code"}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                defaultValue={supplier.name}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.name] = el)
                }
                error={inputVisuals[inputRefMap.name].error}
                helperText={inputVisuals[inputRefMap.name].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.name])
                }
                required={inputMap[inputRefMap.name].validation.required}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Supplier Name"}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={2} sx={{ "& > legend": { mt: -0.5 }, }} >
              <Typography component="legend">Trust Rating</Typography>
              <Rating
                onChange={(e, value) => {
                  console.log(value);
                  setSupplier({ ...supplier, trust_factor: value });
                }}
                name="half-rating"
                value={supplier.trust_factor}
                precision={0.5}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                defaultValue={supplier.created_date }
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.created_date] = el)
                }
                error={inputVisuals[inputRefMap.created_date].error}
                helperText={inputVisuals[inputRefMap.created_date].helperText}
                onBlur={(event) =>
                  onInputBlur(event, inputMap[inputRefMap.created_date])
                }
                required={inputMap[inputRefMap.created_date].validation.required}
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Created Date"}
                type={"date"}
                value={supplier.created_date ? supplier.created_date.split('T')[0] : null}
              ></TextField>
            </Grid>
            <Grid item xs={4.5}>
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
            <Grid item xs={4}>
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
            <Grid item xs={2.5}>
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
            <Grid item xs={5.5}>
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
            <Grid item xs={5.5}>
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
      <NavTab>

        <LinkTab label="Products" href= "products" tab_id={tab_id} disable={id === 'new'}/>
        <LinkTab label="Order History" href= "order-history" tab_id={tab_id} disable={true}/>
      </NavTab>
      {
          (tab_id && tab_id === "products" && 
        <SupplierProductPage></SupplierProductPage>)
      }
    </>
  );
};
