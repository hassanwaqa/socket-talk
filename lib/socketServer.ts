import { Server } from 'socket.io';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    console.log('[socket] client connected:', socket.id);

    socket.on('message', async (data) => {
			console.log('data', data)
      const { event, requestId, Authorization, payload } = data;

      if (!Authorization || !Authorization.startsWith('Bearer')) {
        return socket.emit('message', {
          event,
          requestId,
          statusCode: 401,
          error: 'Unauthorized',
        });
      }

      switch (event) {
        case 'threads':
          return socket.emit('message', {
            event: 'threads',
            requestId,
            statusCode: 200,
            payload: {
              data: [{ id: 1, name: 'Dummy Thread' }],
              count: 1,
            },
          });

        // Add more cases here
      }
    });
  });
}
