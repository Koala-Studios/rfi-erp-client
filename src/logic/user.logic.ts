import axios, { AxiosRequestConfig } from "axios";
import apiStatus from "./apiStatus";

export interface INotification {
	_id: string;
	action: number;
	object: string;
}


const api = axios.create({
	baseURL: "http://localhost:5000",
});

export const getUser = async (
	token: string | null,
	SetStoreCallback: any
) => {
	if (!token) return false;
	let success = false;

	const config = {
		headers: { Authorization: `Bearer ${token}` },
	};
	await api
		.get("/user/getUser", config)
		.then((res) => {
			if (res.status === apiStatus.OK) {
				success = true;
				SetStoreCallback(res.data);
			}
		})
		.catch((err) => {
			console.log(err);
		});
	return success;
};

// export const getNotifications = async (
// 	Store: IStore
// ): Promise<INotification[]> => {
// 	let notifications: INotification[] = [];

// 	const config = {
// 		headers: { Authorization: `Bearer ${Store.token}` },
// 	};
// 	await api
// 		.get("/user/getNotifications", config)
// 		.then((res) => {
// 			if (res.status === apiStatus.OK) {
// 				notifications = res.data;
// 			}
// 		})
// 		.catch((err) => {
// 			console.log(err);
// 		});

// 	return notifications;
// };