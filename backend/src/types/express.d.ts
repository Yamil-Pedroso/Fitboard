declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        isAdmin: boolean;
      };
    }
  }
}
export {};
