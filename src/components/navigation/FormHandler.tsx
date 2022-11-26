import React, { useEffect, useRef, useState } from "react";
import { formBlueprints, IFormType } from "../../logic/form.logic";
import FormDialog from "../utils/FormDialog";
import { FormField } from "../utils/FormField";

let submitCallback: any = null;

const FormHandler = () => {
  const [currForm, SetCurrForm] = useState<IFormType | null>(null);
  const [formOpen, SetFormOpen] = useState<boolean>(false);
  //   const [submitCallback, SetSubmitCallback] = useState<any>();
  const formEls = useRef<any[]>([]);

  useEffect(() => {
    // Update the document title using the browser API

    window.addEventListener("OpenFormEvent", (e: any) => {
      const formType: number = e.detail.formType;
      //   SetSubmitCallback((formData: any) => e.detail.onSubmit(formData));
      submitCallback = e.detail.onSubmit;
      SetCurrForm(formBlueprints[formType]);
      SetFormOpen(true);
    });
  }, []);

  if (currForm == null) return <></>;

  const submitFunction = () => {
    //dynamically get final values from form fields
    //put it all into an object
    //pass it through the callback
    let formData: any = {};

    currForm.formFields.map((formField, idx) => {
      formData[formField.handle] = formEls.current[idx].value;
    });

    //TODO:validate the form before submiting and closing

    submitCallback(formData);
    SetFormOpen(false);
    SetCurrForm(null);
  };

  return (
    <FormDialog
      title={currForm.title}
      open={formOpen}
      setOpen={SetFormOpen}
      submitText={currForm.submitText}
      onSubmit={submitFunction}
    >
      {currForm.formFields.map((formField, idx) => {
        return (
          <FormField
            required={formField.required}
            label={formField.label}
            placeholder={formField.default}
            type={formField.type}
            key={`${idx}${formField.label}`}
            ref={(element: any) => formEls.current.push(element)}
          />
        );
      })}
    </FormDialog>
  );
};

export default FormHandler;
