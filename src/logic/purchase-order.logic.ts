import axios from "axios";
import apiStatus from "./apiStatus";


interface IOrderItemContainer {
    product_code:string;
    product_name:string;
    lot_number:string;
    quantity:number;
    price:number;
    status:number;
    material_id:string;
    date_arrived?:string;
}
export interface IPurchaseOrder {
    _id:string;
    supplier_code:string;
    supplier:string;
    order_code:string;
    order_items:[IOrderItemContainer]
}

const api = axios.create({
	baseURL: "http://localhost:5000/purchase-orders",
});

export const listPOs = async (
    token:string,
    count:number,
	page: number
): Promise<IPurchaseOrder[]> => {
	const config = {
		headers: { Authorization: `Bearer ${token}` },
		params: {
			count,
			page,
		},
	};

	let po_list: IPurchaseOrder[] = [];

	await api
		.get("/list", config)
		.then((res) => {
			if (res.status === apiStatus.OK) {
				po_list = res.data;
			}
		})
		.catch((err) => {
			console.log(err);
		});

	return po_list;
};

export const getProduct = async (
    token:string,
    id:string
): Promise<IPurchaseOrder | null> => {
	const config = {
		headers: { Authorization: `Bearer ${token}` },
		params: {
			id:id
		},
	};

	let purchase_order: IPurchaseOrder | null = null;

	await api
		.get("/get", config)
		.then((res) => {
			if (res.status === apiStatus.OK) {
				purchase_order = res.data;
			}
		})
		.catch((err) => {
			console.log(err);
		});

	return purchase_order;
};