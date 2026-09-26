import { resolvePwaRegistration, type PwaUiStatus } from "../studyHub/adapters/pwa";

export function registerPwa(): Promise<PwaUiStatus> {
  return resolvePwaRegistration();
}
