import { Card, Button, Grid, TextField, Chip, Typography, Rating } from "@mui/material";
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { getProduct } from "../../logic/product.logic";
import {
  createCustomer,
  getCustomer,
  ICustomer,
  updateCustomer,
} from "../../logic/customer.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../../components/forms/SaveForm";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import NavTab from "../../components/utils/NavTab";
import LinkTab from "../../components/utils/LinkTab";

const emptyCustomer: ICustomer = {
  _id: "new",
  name: "",
  contact_name: "",
  created_date:new Date().toISOString().split('T')[0],
  email: "",
  address_one: "",
  address_two: "",
  code: "",
  phone: "",
  notes: "",
};

let savedCustomer: ICustomer | null = null;

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
    validation: { required: true, genericVal: "Date" },
  },

];


export const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { id, tab_id } = useParams();
  const auth = useContext(AuthContext);
  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [customerSaved, setCustomerSaved] = useState<boolean>(true);

  const inputRefs = useRef<any[]>([]);
  const [inputVisuals, setInputVisuals] = useState<InputVisual[]>(
    Array(inputMap.length).fill({ helperText: "", error: false })
  );

  useEffect(() => {
    if (id === "new") {
      //new Customer, create new on save
      savedCustomer = emptyCustomer;
      setCustomer(emptyCustomer);
    } else {
      getCustomer(id!).then((p) => {
        savedCustomer = p;
        setCustomer(p!);
        // setCustomerSaved(true);
      });
    }
  }, []);

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
    customer[label] = event.target.value;

    setCustomer({ ...customer! });
    setCustomerSaved(false);
  };

  useEffect(() => {
    if (customer == null || customerSaved === false) return;

    if (JSON.stringify(savedCustomer) !== JSON.stringify(customer)) {
      setCustomerSaved(false);
    }
  }, [customer]);

  const saveCustomer = async () => {
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
      const newCustomerId = await createCustomer(customer!);

      if (newCustomerId) {
        navigate(`/customers/${newCustomerId}`, { replace: true });
        setCustomer({ ...customer!, _id: newCustomerId });
      }
    } else {
      const updated = await updateCustomer(customer!);

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
            <Grid item xs={2.5}>
              <TextField
                defaultValue={customer.code}
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
                label={"Customer Code"}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                defaultValue={customer.name}
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
                label={"Customer Name"}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={1}>
            </Grid>
            <Grid item xs={2.5}>
              <TextField
                defaultValue={customer.created_date}
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
              ></TextField>
            </Grid>
            <Grid item xs={4.5}>
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
            <Grid item xs={4}>
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
            <Grid item xs={2.5}>
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
            <Grid item xs={5.5}>
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
            <Grid item xs={5.5}>
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
            <Grid item xs={3}></Grid>
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
<LinkTab label="Order History" href= "order-history" tab_id={tab_id} disable={id === 'new'}/>
</NavTab>
{
  (tab_id && tab_id === "products" && 
  <div></div>) || 
  (tab_id && tab_id === "order-history" && 
  <div></div>)
}
    </>
  );
};
