// pages/api/socket.ts

import { Server as NetServer } from 'http';
import type { NextApiRequest } from 'next';
import { Server as IOServer } from 'socket.io';
import type { NextApiResponseServerIO } from '@/types/next';
import { setupSocketHandlers } from '@/lib/socketServer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log('[socket] Initializing backend Socket.IO');

    const httpServer: NetServer = res.socket.server as any;
    const io = new IOServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: '*',
      },
    });

    setupSocketHandlers(io); // your socket logic here

    res.socket.server.io = io;
  }

  res.end();
}
