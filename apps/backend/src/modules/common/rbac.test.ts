import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { canCloseWorkOrder, canManageUsers } from "./rbac";

describe("RBAC", () => {
  it("admin can manage users", () => {
    expect(canManageUsers(Role.ADMIN)).toBe(true);
    expect(canManageUsers(Role.TECNICO)).toBe(false);
  });

  it("only admin and gestor can close work orders", () => {
    expect(canCloseWorkOrder(Role.ADMIN)).toBe(true);
    expect(canCloseWorkOrder(Role.GESTOR)).toBe(true);
    expect(canCloseWorkOrder(Role.TECNICO)).toBe(false);
  });
});
