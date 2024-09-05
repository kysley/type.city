import { useAtomValue } from "jotai";
import { userbarAtom } from "../state";
import { userbarLookup } from "../utils/userbars";

type UserbarProps = {
  id?: number;
};
function Userbar({ id }: UserbarProps) {
  const userbarId = useAtomValue(userbarAtom);
  const userbarSrc = userbarLookup[id || userbarId];

  return <img src={userbarSrc} alt="userbar" />;
}

export { Userbar, type UserbarProps };
