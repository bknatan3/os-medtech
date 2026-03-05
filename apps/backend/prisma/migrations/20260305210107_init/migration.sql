-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTOR', 'TECNICO', 'LEITOR');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('RASCUNHO', 'ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'FECHADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "razaoSocial" TEXT,
    "cnpj" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "sequenceNextOs" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "patrimonio" TEXT,
    "localizacao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderTemplate" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schemaJson" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "numeroOs" INTEGER,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'RASCUNHO',
    "prioridade" TEXT NOT NULL DEFAULT 'MEDIA',
    "customerId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "criadoPorUserId" TEXT NOT NULL,
    "atribuidoParaUserId" TEXT,
    "descricaoProblema" TEXT,
    "diagnostico" TEXT,
    "servicoExecutado" TEXT,
    "pecasUtilizadasJson" JSONB,
    "tempoGastoMin" INTEGER,
    "custo" DECIMAL(65,30),
    "templateId" TEXT,
    "templateVersion" INTEGER,
    "templateSnapshotJson" JSONB,
    "customValuesJson" JSONB,
    "tecnicoAttachmentId" TEXT,
    "clienteAttachmentId" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderAttachment" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "hash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT,
    "diffJson" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncDevice" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "lastSyncToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncMutation" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "mutationId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncMutation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "WorkOrder_orgId_status_updatedAt_idx" ON "WorkOrder"("orgId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "WorkOrder_orgId_equipmentId_idx" ON "WorkOrder"("orgId", "equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_orgId_numeroOs_key" ON "WorkOrder"("orgId", "numeroOs");

-- CreateIndex
CREATE UNIQUE INDEX "SyncDevice_orgId_deviceId_key" ON "SyncDevice"("orgId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncMutation_orgId_deviceId_mutationId_key" ON "SyncMutation"("orgId", "deviceId", "mutationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderTemplate" ADD CONSTRAINT "WorkOrderTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkOrderTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAttachment" ADD CONSTRAINT "WorkOrderAttachment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAttachment" ADD CONSTRAINT "WorkOrderAttachment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncDevice" ADD CONSTRAINT "SyncDevice_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncMutation" ADD CONSTRAINT "SyncMutation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
