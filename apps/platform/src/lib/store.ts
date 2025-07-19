import { IUser } from "@ping/db";
import { atom } from "jotai";

export const searchResultAtom = atom<IUser[]>([]);
