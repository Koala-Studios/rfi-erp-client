import axios from "axios";
import apiStatus from "./apiStatus";

export interface IBatching {
    _id:string;
    product_id: string;
    quantity: number;
    date_created: Date;
    batch_code: string;
    status: number;
	product_code:string;
  }

const api = axios.create({
	baseURL: "http://localhost:5000/batching",
});

export const listBatching = async (
    token:string,
    count:number,
	page: number
): Promise<IBatching[]> => {
	const config = {
		headers: { Authorization: `Bearer ${token}` },
		params: {
			count: count,
			page: page,
		},
	};

	let batches: IBatching[] = [];

	await api
		.get("/list", config)
		.then((res) => {
			if (res.status === apiStatus.OK) {
				batches = res.data;
			}
		})
		.catch((err) => {
			console.log(err);
		});

	return batches;
};