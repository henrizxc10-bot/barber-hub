export const BARBER_USERNAME = "admin";
export const BARBER_EMAIL = "admin@barberhub.local";

export function isBarberUsername(value: string) {
  return value.trim().toLowerCase() === BARBER_USERNAME;
}

export function getBarberPassword() {
  return import.meta.env.VITE_BARBER_ADMIN_PASSWORD ?? "";
}
