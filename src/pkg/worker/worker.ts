// import async from "async";
import { InviteMailDispatch } from "./mail";

export const worker = {
  mail: {
    dispatch: InviteMailDispatch(),
  },
};
