import { Request, Response, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';
import { Store } from 'express-session';
import session from 'express-session';
import createMemoryStore from 'memorystore';

@Injectable()
export class SessionService {
  store: Store;
  middleware: (req: Request, res: Response, next: NextFunction) => void;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.store = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.middleware = session({
      name: 'login',
      secret: process.env.LOGIN_SECRET,
      resave: false,
      saveUninitialized: false,
      store: this.store,
      cookie: {
        httpOnly: false,
        sameSite: 'none',
        secure: true,
      },
    });
  }

  getMiddleware() {
    return this.middleware;
  }

  getStore(): Store {
    return this.store;
  }
}
