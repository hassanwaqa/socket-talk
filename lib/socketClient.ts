import io from 'socket.io-client';

const socket = io('', {
	path: '/api/socket',
	transports: ['websocket'],
	autoConnect: false,
});

export default socket;
