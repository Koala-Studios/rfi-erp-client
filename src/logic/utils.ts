export const apiStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

export interface IListOptions {
  docs: any[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: any | null;
  page: number;
  totalDocs: number;
  totalPages: number;
  limit: number;
  pagingCounter: number;
}

export interface IListData {
  rows: any;
  listOptions: IListOptions;
}

export interface FilterElement {
  label: string;
  field: string;
  regexOption?: null | string;
  type: "text" | "date" | "number" | "dropdown";
  options?: OptionItem[];
}

export interface OptionItem {
  value: number;
  text: string;
}

export function paramsToObject(entries: any) {
  const result = {};
  for (const [key, value] of entries) {
    // each 'entry' is a [key, value] tupple
    //@ts-ignore
    result[key] = value;
  }
  return result;
}
export function paramsToObjectRegex(entries: any, filters: FilterElement[]) {
  const result: any = {};

  for (const [key, value] of entries) {
    if (key === "page" || key === "count") {
      result[key] = value;

      continue;
    }

    //textfields

    const fe = filters.find((f) => f.field === key);

    if (!fe) continue;

    if (fe.regexOption === undefined) {
      fe.regexOption = "i";
    }

    if (fe.type === "number") {
      result[key] = parseFloat(value);
    } else {
      if (fe.regexOption === null) {
        result[key] = value;
      } else {
        result[key] = { $regex: value, $options: fe.regexOption };
      }
    }
  }
  console.log(result);
  return result;
}

export const getQuery = (
  query: URLSearchParams | undefined,
  filters: FilterElement[]
) => {
  if (!query) return "";

  let q = paramsToObjectRegex(query, filters);
  // q.re = query.re = { $regex: "dfafd", $options: "i" };

  return JSON.stringify(q);
};
