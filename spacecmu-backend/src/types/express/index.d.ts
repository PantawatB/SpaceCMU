import { User as CustomUser } from "../../entities/User";

declare global {
  namespace Express {
    export interface Request {
      user?: CustomUser;
    }
  }
}

export {};
