import axios from "axios";
import apiStatus from "./apiStatus";

export interface IProduct {
    _id:string;
	product_code:string;
	name:string;
	versions:number,
	approved_version:number,
	cost: number;
    date_created: Date;
    status: number;
}

const api = axios.create({
	baseURL: "http://localhost:5000/products",
});

export const listProducts = async (
    token:string,
	approved:boolean,
    count:number,
	page: number
): Promise<IProduct[]> => {
	const config = {
		headers: { Authorization: `Bearer ${token}` },
		params: {
			approved,
			count,
			page,
		},
	};

	let batches: IProduct[] = [];

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

export const getProduct = async (
    token:string,
    id:string
): Promise<IProduct | null> => {
	const config = {
		headers: { Authorization: `Bearer ${token}` },
		params: {
			id:id
		},
	};

	let product: IProduct | null = null;

	await api
		.get("/get", config)
		.then((res) => {
			if (res.status === apiStatus.OK) {
				product = res.data;
			}
		})
		.catch((err) => {
			console.log(err);
		});

	return product;
};