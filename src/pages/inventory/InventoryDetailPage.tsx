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
import { AuthContext } from "../../components/navigation/AuthProvider";
import {
  createInventory,
  getInventory,
  IInventory,
  updateInventory,
} from "../../logic/inventory.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../../components/forms/SaveForm";
import StandaloneAutocomplete from "../../components/utils/StandaloneAutocomplete";
import { IProductType } from "../../logic/product-type.logic";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import NavTab from "../../components/utils/NavTab";
import LinkTab from "../../components/utils/LinkTab";
import InventoryMovementPage from "./InventoryMovementPage";

const emptyInventory: IInventory = {
  _id: "",
  name: "",
  aliases: "",
  description: "",
  rating: null,
  is_solid: false,
  product_code: "",
  date_created: new Date().toISOString().split("T")[0],
  for_sale: false,
  is_raw: false,
  cost: 0,
  quantity: 0,
  stock: {
    on_hand: 0,
    ordered: 0,
    allocated: 0,
    on_hold: 0,
    quarantined: 0,
    average_price: 0,
    reorder_amount: 0,
  },
  regulatory: {
    //TODO: ADD OTHER FIELDS HERE!!
    fda_status: "",
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
  product_type: null,
  cas_number: "",
  reorder_amount: 0,
};

let savedInventory: IInventory | null = null;

const inputRefMap = {
  name: 0,
  date_created: 1,
  material_type: 2,
  // product_code: 2,
  //product_type:3
};

const inputMap: InputInfo[] = [
  { label: "name", ref: 0, validation: { required: true, genericVal: "Text" } },
  {
    label: "date_created",
    ref: 1,
    validation: { required: true, genericVal: "Date" },
  },
  {
    label: "material_type",
    ref: 2,
    validation: { required: true, genericVal: "Text" },
  },
  // { label: "product_code", ref: 2, validation: { required: false, genericVal: "Text" } },
  // { label: "product_type", ref: 3, validation: { required: false, genericVal: "Text" } },
];

export const InventoryDetailPage = () => {
  const navigate = useNavigate();
  const { id, tab_id } = useParams();
  const auth = React.useContext(AuthContext);
  const [inventory, setInventory] = React.useState<IInventory | null>(null);
  const isNewId = id === "new";
  const [productSaved, setInventorySaved] = React.useState<boolean>(true);

  const inputRefs = React.useRef<any[]>([]);
  const [inputVisuals, setInputVisuals] = React.useState<InputVisual[]>(
    Array(inputMap.length).fill({ helperText: "", error: false })
  );

  const onInputBlur = (event: any, input: InputInfo) => {
    const _input = inputRefs.current[input.ref];

    const inputVal = isValid(_input.value, inputMap[input.ref].validation);
    inputVisuals[input.ref] = {
      helperText: inputVal.msg,
      error: !inputVal.valid,
    };

    setInputVisuals({ ...inputVisuals });

    const label = inputMap[input.ref].label;
    //@ts-ignore
    inventory[label] = event.target.value;

    setInventory({ ...inventory! });
    setInventorySaved(false);
  };
  const InventoryStatus = [
    ["PENDING", "error"],
    ["IN PROGRESS", "warning"],
    ["AWAITING APPROVAL", "info"],
    ["APPROVED", "success"],
    ["DRAFT", "warning"],
  ];

  useEffect(() => {
    if (isNewId) {
      //new inventory, create new on save
      savedInventory = emptyInventory;
      setInventory(emptyInventory);
    } else {
      getInventory(id!).then((p) => {
        console.log(p, "test");
        savedInventory = p;
        setInventory(p!);
        // setInventorySaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (inventory == null || productSaved === false) return;

    if (JSON.stringify(savedInventory) !== JSON.stringify(inventory)) {
      setInventorySaved(false);
    }
  }, [inventory]);

  const saveInventory = async () => {
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

    //send new inventory to server
    if (id === "new") {
      createInventory(inventory!).then((_inventory) => {
        if (_inventory) {
          console.log(_inventory);
          navigate(`/inventory/${_inventory._id}`, { replace: true });
          savedInventory = _inventory;
          setInventory(_inventory); //THIS IS NOT WORKING ...
          setInventorySaved(true);
        } else {
          console.log("Material Not Saved");
        }
      });
    } else {
      const updated = await updateInventory(inventory!);

      if (updated === false) {
        throw Error("Update Material Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setInventorySaved(true);
  };
  const cancelSaveInventory = () => {
    setInventory(savedInventory);
    setInventorySaved(true);
  };

  if (inventory == null) return null;

  return (
    <>
      <SaveForm
        display={!productSaved}
        onSave={saveInventory}
        onCancel={cancelSaveInventory}
      ></SaveForm>
      <Card variant="outlined" style={{ padding: 16, marginBottom: 10 }}>
        <div style={{ display: "flex", marginLeft: 5, marginBottom: 15 }}>
          <Button
            aria-label="go back"
            size="medium"
            variant="outlined"
            onClick={() => navigate("/inventory")}
          >
            <ArrowBackIcon fontSize="small" />
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 10,
            maxWidth: "70%",
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <TextField
                value={inventory.product_code}
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
                label={"Material Code"}
              ></TextField>
            </Grid>
            <Grid item xs={5}>
              <TextField
                defaultValue={inventory.name}
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
                label={"Material Name"}
                InputProps={{}}
              ></TextField>
            </Grid>
            <Grid item xs={2} sx={{ "& > legend": { mt: -0.5 } }}>
              <Typography component="legend">Rating</Typography>
              <Rating
                onChange={(e, value) => {
                  console.log(value);
                  setInventory({ ...inventory, rating: value });
                }}
                name="half-rating"
                value={inventory.rating}
                precision={0.5}
              />
            </Grid>

            <Grid item xs={3}>
              <StandaloneAutocomplete
                initialValue={inventory.product_type}
                inputRef={(el: any) =>
                  (inputRefs.current[inputRefMap.material_type] = el)
                }
                error={inputVisuals[inputRefMap.material_type].error}
                helperText={inputVisuals[inputRefMap.material_type].helperText}
                onChange={(event, value) => {
                  setInventory({ ...inventory, product_type: value });
                  // onInputBlur(event, inputMap[inputRefMap.material_type]);
                }}
                onBlur={(event: any) =>
                  onInputBlur(event, inputMap[inputRefMap.material_type])
                }
                required={
                  inputMap[inputRefMap.material_type].validation.required
                }
                readOnly={!isNewId}
                // onChange={(e, value) => {}}
                label={"Material Type"}
                letterMin={0}
                dbOption={"product-type-raw"}
                getOptionLabel={(item: IProductType) =>
                  item.code + " | " + item.name
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                onChange={(e) =>
                  setInventory({ ...inventory, aliases: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Material Aliases"}
                value={inventory.aliases}
                multiline
                rows={2}
              ></TextField>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={2}>
              <TextField
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Cost"}
                value={inventory.cost.toFixed(2)}
                InputProps={{
                  readOnly: true,
                }}
              ></TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                defaultValue={inventory.date_created}
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
            <Grid item xs={12}>
              <TextField
                onChange={(e) =>
                  setInventory({ ...inventory, description: e.target.value })
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Flavor Profile"}
                value={inventory.description}
                multiline
                rows={6}
              ></TextField>
            </Grid>
          </Grid>

          {/* <Card
            variant="outlined"
            style={{ width: "40%", minWidth: "40%", padding: 16 }}
          >
            <div>
              <Typography variant="h6">Overview Stats</Typography>
            </div>
          </Card> */}
        </div>
      </Card>
      <NavTab tab_id={tab_id}>
        <LinkTab
          label="Suppliers"
          href="suppliers"
          tab_id={tab_id}
          disable={id === "new"}
        />
        <LinkTab
          label="Movements"
          href="movements"
          tab_id={tab_id}
          disable={id === "new"}
        />
        <LinkTab
          label="Usage Stats"
          href="stats"
          tab_id={tab_id}
          disable={id === "new"}
        />
      </NavTab>
      {tab_id && tab_id === "movements" && <InventoryMovementPage />}
    </>
  );
};
