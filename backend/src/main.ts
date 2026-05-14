import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/error';
import { authRequired } from './middleware/auth';
import { handleRegister, handleLogin, handleGetProfile } from './handler/auth';
import { handleCreatePet, handleGetUserPets, handleUpdatePet, handleDeletePet } from './handler/pet';

// Fix BigInt JSON serialization (Prisma uses BigInt for auto-increment IDs)
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', data: { service: 'pethub', version: '0.1.0' } });
});

// Auth routes
app.post('/api/v1/auth/register', handleRegister);
app.post('/api/v1/auth/login', handleLogin);
app.get('/api/v1/users/me', authRequired, handleGetProfile);

// Pet routes
app.post('/api/v1/pets', authRequired, handleCreatePet);
app.get('/api/v1/pets', authRequired, handleGetUserPets);
app.put('/api/v1/pets/:id', authRequired, handleUpdatePet);
app.delete('/api/v1/pets/:id', authRequired, handleDeletePet);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[PetHub] Server running on http://localhost:${config.port}`);
});

export default app;
