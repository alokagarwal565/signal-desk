import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, TokenPayload } from '../modules/auth/auth.service.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: TokenPayload;
  }
}

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing authorization header' });
  }
  const token = header.slice(7);
  req.user = verifyToken(token);
}
