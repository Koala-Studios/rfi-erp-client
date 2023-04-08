export interface ValidationInfo {
  required: boolean;
  genericVal?: "Text" | "Date";
  validateCustom?: any; //takes in a value and returns boolean
}

export interface InputVisual {
  error?: boolean;
  helperText?: string;
}

export interface InputInfo {
  label: string;
  ref: number;
  validation: ValidationInfo;
}

const errorMessage = {
  TextEmpty: "Text is Empty",
  InvalidDate: "Invalid Date",
  RequiredField: "Required Field",
};

export const isValid = (
  value: any,
  validation: ValidationInfo
): { valid: boolean; msg?: string } => {
  let isValid = true;
  let message: string = "";

  if (validation.required && (value === undefined || value === null)) {
    return { valid: false, msg: errorMessage.RequiredField };
  }

  if (validation.validateCustom) {
    isValid = validation.validateCustom(value);
    if (isValid === false) return { valid: isValid, msg: message };
  }

  if (validation.genericVal) {
    if (validation.genericVal === "Text") {
      if (validation.required && !value) {
        isValid = false;
        message = errorMessage.TextEmpty;
      }
    } else if (validation.genericVal === "Date") {
    }
  }

  if (isValid === false) return { valid: false, msg: message };

  return { valid: true };
};

const validateText = (value: string): boolean => {
  return true;
};
const validateDate = (value: string): boolean => {
  return true;
};

export const validateInput = (input: any, map: InputInfo[]): InputVisual => {
  const inputValidation = isValid(input.value, map[input.ref].validation);

  if (inputValidation.valid === false) {
    return {
      helperText: inputValidation.msg,
      error: true,
    };
  } else {
    return { helperText: "", error: false };
  }
};
