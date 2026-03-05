import bcrypt from "bcryptjs";
import { PrismaClient, Role, WorkOrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.syncMutation.deleteMany();
  await prisma.syncDevice.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.workOrderAttachment.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.workOrderTemplate.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: { nomeFantasia: "Demo MedTech", sequenceNextOs: 6 }
  });

  const pass = await bcrypt.hash("senha123", 10);
  const [admin, gestor, tecnico1, tecnico2] = await Promise.all([
    prisma.user.create({ data: { orgId: org.id, name: "Admin Demo", email: "admin@demo.com", passwordHash: pass, role: Role.ADMIN } }),
    prisma.user.create({ data: { orgId: org.id, name: "Gestor Demo", email: "gestor@demo.com", passwordHash: pass, role: Role.GESTOR } }),
    prisma.user.create({ data: { orgId: org.id, name: "Tecnico 1", email: "tecnico1@demo.com", passwordHash: pass, role: Role.TECNICO } }),
    prisma.user.create({ data: { orgId: org.id, name: "Tecnico 2", email: "tecnico2@demo.com", passwordHash: pass, role: Role.TECNICO } })
  ]);

  const customers = await Promise.all(
    ["Hospital Central", "Clinica Vida", "Laboratorio Alfa"].map((name) =>
      prisma.customer.create({ data: { orgId: org.id, name } })
    )
  );

  const equipment = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.equipment.create({
        data: {
          orgId: org.id,
          customerId: customers[i % customers.length].id,
          tipo: i % 2 ? "Monitor" : "Autoclave",
          fabricante: "Fabricante X",
          modelo: `Modelo-${i + 1}`,
          numeroSerie: `SERIE-${1000 + i}`
        }
      })
    )
  );

  const template = await prisma.workOrderTemplate.create({
    data: {
      orgId: org.id,
      name: "Padrao Autoclave",
      schemaJson: {
        secoes: ["Identificacao", "Diagnostico", "Checklist", "Assinaturas"],
        campos: [
          { key: "temperatura", tipo: "numero", obrigatorio: true },
          { key: "vazamento", tipo: "checkbox", obrigatorio: false }
        ]
      }
    }
  });

  for (let i = 0; i < 5; i += 1) {
    await prisma.workOrder.create({
      data: {
        id: crypto.randomUUID(),
        orgId: org.id,
        numeroOs: i + 1,
        status: [WorkOrderStatus.ABERTA, WorkOrderStatus.EM_ANDAMENTO, WorkOrderStatus.CONCLUIDA, WorkOrderStatus.FECHADA, WorkOrderStatus.RASCUNHO][i],
        customerId: customers[i % customers.length].id,
        equipmentId: equipment[i].id,
        criadoPorUserId: tecnico1.id,
        atribuidoParaUserId: tecnico2.id,
        descricaoProblema: "Equipamento sem aquecimento",
        templateId: template.id,
        templateVersion: template.version,
        templateSnapshotJson: template.schemaJson as any
      }
    });
  }

  await prisma.auditEvent.create({
    data: {
      orgId: org.id,
      entidade: "SEED",
      entidadeId: org.id,
      acao: "CREATE",
      userId: admin.id
    }
  });

  await prisma.$disconnect();
  console.log("Seed finalizada.");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
