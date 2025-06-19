import { EVENTS } from "./events";
import { emitSocketRequest } from "./socketRequestManager";

export const fetchAllThreadsSocket = async ({ StaffCellNumber }: { StaffCellNumber: String }) => {
	emitSocketRequest(EVENTS.THREADS, {
		query: {
			staffCellNumber: StaffCellNumber,
			pageOffset: 0,
			pageLimit: 10,
		},
	});
};

export const fetchNewUsers = async ({ userId = "" } : { userId?: String}) => {
	emitSocketRequest(EVENTS.NEW_USERS, {
		query: {
			userId: userId,
			pageOffset: 0,
			pageLimit: 10,
		},
	});
}


export const fetchThreadMessage = async ({ threadId = "", pageOffset }: { threadId: String, pageOffset: Number }) => {
	emitSocketRequest(EVENTS.THREAD_MESSAGES, {
		params: {
			threadId: threadId,
		},
		query: {
			pageOffset: pageOffset,
			pageLimit: 20,
		},
	});
};

export const updateMessageStatus = async ({ messageId, status = "read" }: { messageId: String, status: String }) => {
	console.log("messageId", messageId);
	emitSocketRequest(EVENTS.UPDATE_MESSAGE_STATUS, {
		params: {
			messageId: messageId,
		},
		body: {
			status: status,
		},
	});
};

export const sendMessageSocket = async ({ threadId, messageBody = "" } : {threadId: String, messageBody: any}) => {
	emitSocketRequest(EVENTS.SEND_MESSAGE, {
		params: {
			threadId: threadId,
		},
		body: {
			...messageBody,
		},
	});
};
