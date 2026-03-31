import { getActiveProfileId } from './profile';

export function requireProfileIdOrRedirect() {
  const id = getActiveProfileId();
  if (!id) {
    window.location.href = '/';
    return false;
  }
  return true;
}
