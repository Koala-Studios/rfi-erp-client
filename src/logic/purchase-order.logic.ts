import axios from "axios";
import apiStatus from "./apiStatus";


interface IOrderItem {
    product_code:string;
    product_name:string;
    lot_number:string;
    quantity:number;
    price:number;
    status:number;
    product_id:string;
    date_arrived?:string;
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
