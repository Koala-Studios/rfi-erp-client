import { Autocomplete, Paper, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { lookup } from "../../logic/autocomplete.logic";
import { AuthContext } from "../navigation/AuthProvider";

interface Props {
  initialValue: any;

  getOptionLabel: (option: any) => string;
  label: string;
  placeholder?: string;
  letterMin: number;
  dbOption: "customer" | "inventory" | "user" | "supplier" | "product-type";
  onChange?: (event: React.SyntheticEvent<Element, Event>, value: any) => void;
}

const StandaloneAutocomplete: React.FC<Props> = ({
  onChange,
  letterMin,
  placeholder,
  label,
  dbOption,
  getOptionLabel,
  initialValue,
}) => {
  const [optionList, setOptionList] = React.useState<any>([]);
  const auth = React.useContext(AuthContext);

  useEffect(() => {
    if (letterMin === 0) {
      lookup(auth.token, "", dbOption, letterMin).then((result) => {
        setOptionList(result);
      });
    }
  }, []);

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => {
    lookup(auth.token, value.toUpperCase(), dbOption, letterMin).then(
      (result) => {
        setOptionList(result);
      }
    );
  };

  return (
    <Autocomplete
      value={initialValue}
      clearOnBlur={true}
      blurOnSelect={false}
      onChange={onChange}
      openOnFocus
      selectOnFocus
      getOptionLabel={getOptionLabel}
      options={optionList}
      PaperComponent={({ children }) => (
        <Paper
          variant="outlined"
          style={{
            // background: "#e4e6ee",
            border: "1px solid #00000050",
            boxShadow: "0 0 10px 0 #00000030",
            fontSize: "16px",
            marginTop: 5,
            overflow: "hidden",
            // maxWidth: "450px",
            // minWidth: "450px",
          }}
        >
          {children}
        </Paper>
      )}
      onInputChange={handleInputChange}
      renderInput={(params) => {
        return (
          <TextField
            label={label}
            variant="outlined"
            placeholder={placeholder}
            {...params}
            size="small"
          />
        );
      }}
    />
  );
};

export default StandaloneAutocomplete;

// const handleCreateBtn = () => {
//   // if (inputEl!) return;

//   //@ts-ignore
//   const textValue = inputEl.current.value;
//   if (dbOption === "customer") {
//     const newCustomer: ICustomer = {
//       //temporary
//       _id: "",
//       name: textValue,
//     };
//     createCustomer(auth.token, newCustomer).then((customerId) => {
//       if (customerId) {
//         newCustomer._id = customerId;
//         setDisplayList([newCustomer, ...displayList]);
//       }
//     });
//   }
// };
