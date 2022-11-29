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
}

export interface IListData {
  rows: any;
  listOptions: IListOptions;
}
