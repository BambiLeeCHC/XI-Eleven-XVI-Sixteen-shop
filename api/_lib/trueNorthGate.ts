import {
  canSeeTrueNorth,
  parseTrueNorthAllowlist,
  trueNorthFlagOn,
} from "../../src/lib/trueNorthAccess.js";
import { type ApiRequest, currentUser, HttpError } from "./server.js";

/** Block True North APIs unless the public flag is on or the caller is the owner. */
export async function assertTrueNorthOpen(req: ApiRequest) {
  const enabled = trueNorthFlagOn(
    process.env.VITE_TRUE_NORTH_ENABLED || process.env.TRUE_NORTH_ENABLED,
  );
  if (enabled) return;
  const allowlist = parseTrueNorthAllowlist(
    process.env.VITE_TRUE_NORTH_ALLOWLIST || process.env.TRUE_NORTH_ALLOWLIST,
  );
  const user = await currentUser(req);
  const open = canSeeTrueNorth({
    enabled: false,
    role: user?.role,
    email: user?.email,
    userId: user?.id,
    allowlist,
  });
  if (!open) throw new HttpError(403, "True North is coming soon.");
}
