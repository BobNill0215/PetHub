import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://pethub:pethub123@localhost:5432/pethub',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};
