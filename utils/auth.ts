import { usePrivy } from "@privy-io/expo";

export async function checkIfUserIsLoggedIn() {
  const { user } = usePrivy();
  if (user) {
    return true;
  } else {
    return false;
  }
}
