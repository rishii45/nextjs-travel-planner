import { UserType } from "@/types/user";
import { StateCreator } from "zustand";

export interface AuthSlice {
  userInfo: undefined | UserType;
  setUserInfo: (UserInfo: UserType) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  userInfo: undefined,
  setUserInfo: (userInfo: UserType) => set({ userInfo }),
});
