import { Autocomplete, Paper, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { lookup } from "../../logic/autocomplete.logic";
import { AuthContext } from "../navigation/AuthProvider";

interface Props {
  initialValue: any;

  getOptionLabel: (option: any) => string;
  label: string;
  readOnly?:boolean;
  placeholder?: string;
  letterMin: number;
  dbOption:
  | "customer"
  | "inventory"// all products and materials
  | "material" // not for sale
  | "raw-mat" //is raw, not for sale
  | "non-raw-mat" //is not raw, not for sale
  | "product" //for sale
  | "approved-product" //approved and for sale
  | "approved-product-all" //for sale and not for sale, just approved that matters
  | "user"
  | "supplier"
  | "product-type"
  | "product-type-mat"
  | "product-type-raw";
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
  readOnly = false
}) => {
  const [optionList, setOptionList] = React.useState<any>([]);
  const auth = React.useContext(AuthContext);

  useEffect(() => {
    if (letterMin === 0) {
      lookup("", dbOption, letterMin).then((result) => {
        setOptionList(result);
      });
    }
  }, []);

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => {
    lookup(value.toUpperCase(), dbOption, letterMin).then((result) => {
      setOptionList(result);
    });
  };

  return (
    <Autocomplete
      value={initialValue}
      isOptionEqualToValue={(option, value) => option._id === value || option._id === value._id}
      clearOnBlur={true}
      blurOnSelect={false}
      readOnly={readOnly}
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
//     createCustomer(newCustomer).then((customerId) => {
//       if (customerId) {
//         newCustomer._id = customerId;
//         setDisplayList([newCustomer, ...displayList]);
//       }
//     });
//   }
// };
