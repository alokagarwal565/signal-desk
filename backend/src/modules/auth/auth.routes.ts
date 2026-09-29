import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { registerUser, loginUser } from './auth.service.js';
import { AppError } from '../../utils/errors.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/register', async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const user = await registerUser(body.email, body.password, body.name);
    return reply.status(201).send({ user });
  });

  app.post('/api/auth/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body.email, body.password);
    return reply.send(result);
  });
}
