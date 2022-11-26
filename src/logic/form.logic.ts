export interface IFormField {
  handle: string;
  type: string;
  label: string;
  default?: any;
  required?: boolean;
}

export interface IFormType {
  title: string;
  submitText: string;
  formFields: IFormField[];
}

export const formTypes = {
  CreateProject: 0,
};

export const formBlueprints: IFormType[] = [
  {
    title: "Create Project",
    submitText: "Create",
    formFields: [
      {
        handle: "project_name",
        type: "text",
        label: "Project Name",
        required: true,
      },
    ],
  },
];
