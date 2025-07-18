import * as express from "express";
import { CurrentUser } from "../auth";

declare global {
  namespace Express {
    export interface Request {
      user: CurrentUser;
    }
  }
}
