import { Card, Button, Grid, TextField, Chip, Typography } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../components/navigation/AuthProvider";
import { createLocation, getLocation, ILocation, updateLocation } from "../../logic/location.logic";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveForm from "../../components/forms/SaveForm";
import { InputInfo, InputVisual, isValid } from "../../logic/validation.logic";
import React from "react";

const emptyLocation: ILocation = {
  _id: "new",
  name: "",
  code: "",
  description: "",
  total_containers: 0,
  created_date: new Date().toISOString().split('T')[0]
};



let savedLocation: ILocation | null = null;


const inputRefMap = {
    name: 0,
    created_date:1,
    code: 2,
    description:3
    
  };
  
  const inputMap: InputInfo[] = [
    { label: "name", ref: 0, validation: { required: true, genericVal: "Text" } },
    {
      label: "created_date",
      ref: 1,
      validation: { required: true, genericVal: "Date" },
    },
    { label: "code", ref: 2, validation: { required: true, genericVal: "Text" } },
    { label: "description", ref: 3, validation: { required: false, genericVal: "Text" } },
  ];

export const LocationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = useContext(AuthContext);
  const [location, setLocation] = useState<ILocation | null>(null);
  const [locationSaved, setLocationSaved] = useState<boolean>(true);
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
    location[label] = event.target.value;

    setLocation({ ...location! });
    setLocationSaved(false);
  };

  useEffect(() => {
    if (id === "new") {
      //new Location, create new on save
      savedLocation = emptyLocation;
      setLocation(emptyLocation);
    } else {
      getLocation(id!).then((l) => {
        console.log(l)
        savedLocation = l;
        setLocation(l!);
        // setLocationSaved(true);
      });
    }
  }, []);

  useEffect(() => {
    if (location == null || locationSaved === false) return;

    if (JSON.stringify(savedLocation) !== JSON.stringify(location)) {
      console.log(JSON.stringify(savedLocation), JSON.stringify(location), "test");
      setLocationSaved(false);
    }
  }, [location]);

  const saveLocation = async () => {
    
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
    // send new location to server
    if (id === "new") {
      const newLocationId = await createLocation(location!);

      if (newLocationId) {
        navigate(`/locations/${newLocationId}`, { replace: true });
        setLocation({ ...location!, _id: newLocationId });
      }
    } else {
      const updated = await updateLocation(location!);

      if (updated === false) {
        throw Error("Update Project Error");
      }
    }
    window.dispatchEvent(
      new CustomEvent("NotificationEvent", {
        detail: { text: "Changes Saved" },
      })
    );
    setLocationSaved(true);
  };
  const cancelSaveLocation = () => {
    setLocation(savedLocation);
    setLocationSaved(true);
  };

  if (location == null) return null;

  return (
    <>
      <SaveForm
        display={!locationSaved}
        onSave={saveLocation}
        onCancel={cancelSaveLocation}
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
        </Button>
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          <Grid container spacing={3}>
          <Grid item xs={3}>
              <TextField
                defaultValue={location!.code}
                inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.code] = el)
                }
                error={inputVisuals[inputRefMap.code].error}
                helperText={inputVisuals[inputRefMap.code].helperText}
                onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.code])
                }
                required={
                    inputMap[inputRefMap.code].validation.required
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Location Code"}
              ></TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                defaultValue={location!.name}
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
                label={"Location Name"}
              ></TextField>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
              <TextField
                defaultValue={location!.created_date ? location!.created_date.split('T')[0] : null}
                inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.created_date] = el)
                }
                error={inputVisuals[inputRefMap.created_date].error}
                helperText={inputVisuals[inputRefMap.created_date].helperText}
                onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.created_date])
                }
                required={
                    inputMap[inputRefMap.created_date].validation.required
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
                label={"Created Date"}
                type={"date"}
              ></TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                defaultValue={location!.description}
                inputRef={(el: any) =>
                    (inputRefs.current[inputRefMap.description] = el)
                }
                error={inputVisuals[inputRefMap.description].error}
                helperText={inputVisuals[inputRefMap.description].helperText}
                onBlur={(event) =>
                    onInputBlur(event, inputMap[inputRefMap.description])
                }
                required={
                    inputMap[inputRefMap.description].validation.required
                }
                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                multiline={true}
                rows={3}
                variant="outlined"
                label={"Location Description"}
                type="string"
              ></TextField>
            </Grid>
            
            <Grid item xs={4}></Grid>
            
            <Grid item xs={2}>
                <TextField

                spellCheck="false"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                variant="outlined"
                label={"Total Containers"}
                type="string"
                value={location!.total_containers}>
                </TextField>
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
