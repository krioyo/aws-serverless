import { Request, Response, NextFunction } from 'express';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Not Authorized.' });
  }
  next();
};

export { requireAuth };