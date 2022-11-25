import axios from "axios";
import apiStatus from "./apiStatus";


interface IOrderItem {
    product_code:string;
    material_name:string;
    lot_number:string;
    amount:number;
    price:number;
    status:number;
    material_id:string;
}
export interface IPurchaseOrder {
    _id:string;
	supplier_code:string;
    supplier:string;
	date_arrived: Date,
	date_purchased:Date,
	status: Number,
    order_code:string;

    order_items:[IOrderItem]
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


export const getPurchase = async (
    token:string,
    id:string
): Promise<IPurchaseOrder | null> => {
	const config = {
		headers: { Authorization: `Bearer ${token}` },
		params: {
			id:id
		},
	};

	let purchase: IPurchaseOrder | null = null;

	await api
		.get("/get", config)
		.then((res) => {
			if (res.status === apiStatus.OK) {
				purchase = res.data.res;
			  }
			  window.dispatchEvent(new CustomEvent('NotificationEvent', { detail: res.data.message }));
		})
		.catch((err) => {
			console.log(err);
		});

	return purchase;
};
