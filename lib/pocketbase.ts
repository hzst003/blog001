import PocketBase from 'pocketbase';

export function createPocketBase() {
  return new PocketBase(process.env.POCKETBASE_URL!);
}

export async function getPocketBase() {
  return createPocketBase();
}
