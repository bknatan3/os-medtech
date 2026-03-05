import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6)
});

export const syncMutationSchema = z.object({
  mutation_id: z.string().uuid(),
  operation: z.enum(["create", "update", "status-change"]),
  entity: z.string(),
  payload: z.any()
});
