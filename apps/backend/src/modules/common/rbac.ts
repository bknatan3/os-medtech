import { Role } from "@prisma/client";

export function canManageUsers(role: Role): boolean {
  return role === Role.ADMIN;
}

export function canCloseWorkOrder(role: Role): boolean {
  return role === Role.ADMIN || role === Role.GESTOR;
}
