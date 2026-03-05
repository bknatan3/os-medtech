import { clearMutation, listPendingMutations } from "../db/sqlite";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3333";
const TOKEN = process.env.EXPO_PUBLIC_TOKEN ?? "";
const DEVICE_ID = process.env.EXPO_PUBLIC_DEVICE_ID ?? "mobile-demo-device";

export async function syncNow(): Promise<boolean> {
  try {
    const pending = (await listPendingMutations()) as Array<{
      id: number;
      mutation_id: string;
      operation_type: string;
      entity: string;
      payload_json: string;
    }>;
    const mutations = pending.map((row) => ({
      mutation_id: row.mutation_id,
      operation: row.operation_type,
      entity: row.entity,
      payload: JSON.parse(row.payload_json)
    }));

    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        device_id: DEVICE_ID,
        last_sync_token: null,
        mutations
      })
    });

    if (!response.ok) return false;
    for (const row of pending) await clearMutation(row.id);
    return true;
  } catch {
    return false;
  }
}
