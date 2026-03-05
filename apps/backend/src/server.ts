import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import bcrypt from "bcryptjs";
import { PrismaClient, Role, WorkOrderStatus } from "@prisma/client";
import { z } from "zod";
import { canCloseWorkOrder, canManageUsers } from "./modules/common/rbac";

const prisma = new PrismaClient();
const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 3333);

type AuthUser = { userId: string; orgId: string; role: Role };

app.register(cors, { origin: true });
app.register(jwt, { secret: process.env.JWT_SECRET ?? "change-me" });
app.register(swagger, {
  openapi: {
    info: { title: "OS MedTech API", version: "1.0.0" }
  }
});
app.register(swaggerUi, { routePrefix: "/api" });

app.decorate("authGuard", async (req: any, reply: any) => {
  try {
    await req.jwtVerify();
  } catch {
    reply.code(401).send({ message: "Nao autorizado" });
  }
});

app.get("/health", async () => ({ status: "ok", now: new Date().toISOString() }));

app.post("/auth/login", async (req, reply) => {
  const schema = z.object({ email: z.string().email(), senha: z.string().min(6) });
  const { email, senha } = schema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return reply.code(401).send({ message: "Credenciais invalidas" });
  const valid = await bcrypt.compare(senha, user.passwordHash);
  if (!valid) return reply.code(401).send({ message: "Credenciais invalidas" });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = await reply.jwtSign({ userId: user.id, orgId: user.orgId, role: user.role });
  return { token, user: { id: user.id, nome: user.name, role: user.role, orgId: user.orgId } };
});

app.get("/auth/me", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const user = req.user as AuthUser;
  return prisma.user.findFirst({
    where: { id: user.userId, orgId: user.orgId },
    select: { id: true, name: true, email: true, role: true, orgId: true }
  });
});

app.post("/auth/refresh", { preHandler: [(app as any).authGuard] }, async (req: any, reply) => {
  const user = req.user as AuthUser;
  const token = await reply.jwtSign({ userId: user.userId, orgId: user.orgId, role: user.role });
  return { token };
});

app.post("/auth/logout", { preHandler: [(app as any).authGuard] }, async () => {
  return { ok: true };
});

app.get("/users", { preHandler: [(app as any).authGuard] }, async (req: any, reply) => {
  const user = req.user as AuthUser;
  if (!canManageUsers(user.role)) return reply.code(403).send({ message: "Sem permissao" });
  return prisma.user.findMany({ where: { orgId: user.orgId }, select: { id: true, name: true, email: true, role: true, active: true } });
});

app.post("/users", { preHandler: [(app as any).authGuard] }, async (req: any, reply) => {
  const me = req.user as AuthUser;
  if (!canManageUsers(me.role)) return reply.code(403).send({ message: "Sem permissao" });
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    senha: z.string().min(6),
    role: z.nativeEnum(Role)
  });
  const body = schema.parse(req.body);
  const passwordHash = await bcrypt.hash(body.senha, 10);
  return prisma.user.create({
    data: { orgId: me.orgId, name: body.name, email: body.email, passwordHash, role: body.role }
  });
});

app.get("/customers", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const me = req.user as AuthUser;
  return prisma.customer.findMany({ where: { orgId: me.orgId } });
});

app.post("/customers", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const me = req.user as AuthUser;
  const body = z.object({ name: z.string().min(2) }).parse(req.body);
  return prisma.customer.create({ data: { orgId: me.orgId, name: body.name } });
});

app.get("/equipment", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const me = req.user as AuthUser;
  return prisma.equipment.findMany({ where: { orgId: me.orgId } });
});

app.post("/equipment", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const me = req.user as AuthUser;
  const body = z.object({
    customerId: z.string().uuid(),
    tipo: z.string(),
    fabricante: z.string(),
    modelo: z.string(),
    numeroSerie: z.string()
  }).parse(req.body);
  return prisma.equipment.create({ data: { ...body, orgId: me.orgId } });
});

app.get("/templates", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const me = req.user as AuthUser;
  return prisma.workOrderTemplate.findMany({ where: { orgId: me.orgId } });
});

app.post("/templates", { preHandler: [(app as any).authGuard] }, async (req: any, reply) => {
  const me = req.user as AuthUser;
  if (!canManageUsers(me.role)) return reply.code(403).send({ message: "Sem permissao" });
  const body = z.object({ name: z.string(), schemaJson: z.any() }).parse(req.body);
  return prisma.workOrderTemplate.create({ data: { orgId: me.orgId, name: body.name, schemaJson: body.schemaJson } });
});

app.get("/work-orders", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const me = req.user as AuthUser;
  const q = z.object({ status: z.nativeEnum(WorkOrderStatus).optional() }).parse(req.query);
  return prisma.workOrder.findMany({
    where: { orgId: me.orgId, status: q.status },
    orderBy: { updatedAt: "desc" },
    include: { customer: true, equipment: true }
  });
});

app.post("/work-orders", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const me = req.user as AuthUser;
  const body = z.object({
    id: z.string().uuid(),
    customerId: z.string().uuid(),
    equipmentId: z.string().uuid(),
    prioridade: z.string().default("MEDIA"),
    descricaoProblema: z.string().optional(),
    templateId: z.string().uuid().optional()
  }).parse(req.body);

  let templateSnapshot = null;
  let templateVersion = null;
  if (body.templateId) {
    const template = await prisma.workOrderTemplate.findFirst({ where: { id: body.templateId, orgId: me.orgId } });
    templateSnapshot = template?.schemaJson ?? null;
    templateVersion = template?.version ?? null;
  }

  return prisma.workOrder.create({
    data: {
      id: body.id,
      orgId: me.orgId,
      customerId: body.customerId,
      equipmentId: body.equipmentId,
      prioridade: body.prioridade,
      descricaoProblema: body.descricaoProblema,
      criadoPorUserId: me.userId,
      templateId: body.templateId,
      templateVersion,
      templateSnapshotJson: templateSnapshot ?? undefined
    }
  });
});

app.patch("/work-orders/:id", { preHandler: [(app as any).authGuard] }, async (req: any, reply) => {
  const me = req.user as AuthUser;
  const body = z.object({ expectedRevision: z.number().int(), diagnostico: z.string().optional(), servicoExecutado: z.string().optional() }).parse(req.body);
  const id = z.string().uuid().parse(req.params.id);
  const current = await prisma.workOrder.findFirst({ where: { id, orgId: me.orgId } });
  if (!current) return reply.code(404).send({ message: "OS nao encontrada" });
  if (current.revision !== body.expectedRevision) {
    return reply.code(409).send({ message: "Conflito de revisao", server_record: current });
  }
  return prisma.workOrder.update({
    where: { id },
    data: {
      diagnostico: body.diagnostico,
      servicoExecutado: body.servicoExecutado,
      revision: { increment: 1 }
    }
  });
});

app.post("/work-orders/:id/status", { preHandler: [(app as any).authGuard] }, async (req: any, reply) => {
  const me = req.user as AuthUser;
  const id = z.string().uuid().parse(req.params.id);
  const body = z.object({ status: z.nativeEnum(WorkOrderStatus) }).parse(req.body);
  if (body.status === WorkOrderStatus.FECHADA && !canCloseWorkOrder(me.role)) return reply.code(403).send({ message: "Sem permissao para fechar OS" });
  const updated = await prisma.workOrder.update({
    where: { id },
    data: { status: body.status, revision: { increment: 1 } }
  });
  await prisma.auditEvent.create({
    data: {
      orgId: me.orgId,
      entidade: "work_order",
      entidadeId: id,
      acao: "STATUS_CHANGE",
      userId: me.userId,
      diffJson: { status: body.status }
    }
  });
  return updated;
});

app.get("/work-orders/:id/pdf", { preHandler: [(app as any).authGuard] }, async (req: any, reply) => {
  const me = req.user as AuthUser;
  const id = z.string().uuid().parse(req.params.id);
  const wo = await prisma.workOrder.findFirst({
    where: { id, orgId: me.orgId },
    include: { customer: true, equipment: true }
  });
  if (!wo) return reply.code(404).send({ message: "OS nao encontrada" });

  const pdf = `%PDF-1.3
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj
4 0 obj << /Length 91 >> stream
BT /F1 16 Tf 50 740 Td (OS MedTech - OS ${wo.numeroOs ?? "PENDENTE"}) Tj T* (Cliente: ${wo.customer.name}) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000213 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
356
%%EOF`;

  reply.header("Content-Type", "application/pdf");
  reply.header("Content-Disposition", `inline; filename="os-${wo.numeroOs ?? wo.id}.pdf"`);
  return reply.send(Buffer.from(pdf, "utf-8"));
});

app.post("/sync", { preHandler: [(app as any).authGuard] }, async (req: any) => {
  const me = req.user as AuthUser;
  const body = z.object({
    device_id: z.string(),
    last_sync_token: z.string().optional(),
    mutations: z.array(z.object({
      mutation_id: z.string().uuid(),
      operation: z.enum(["create", "update", "status-change"]),
      entity: z.enum(["work_order"]),
      payload: z.any()
    }))
  }).parse(req.body);

  for (const mutation of body.mutations) {
    const existing = await prisma.syncMutation.findFirst({
      where: { orgId: me.orgId, deviceId: body.device_id, mutationId: mutation.mutation_id }
    });
    if (existing) continue;
    await prisma.syncMutation.create({
      data: { orgId: me.orgId, deviceId: body.device_id, mutationId: mutation.mutation_id }
    });
  }

  const upserts = await prisma.workOrder.findMany({
    where: { orgId: me.orgId },
    orderBy: { updatedAt: "asc" },
    take: 100
  });

  return {
    new_sync_token: new Date().toISOString(),
    upserts,
    tombstones: [],
    conflicts: []
  };
});

app.listen({ port, host: "0.0.0.0" }).then(() => {
  app.log.info(`Backend iniciado em http://localhost:${port}`);
});
