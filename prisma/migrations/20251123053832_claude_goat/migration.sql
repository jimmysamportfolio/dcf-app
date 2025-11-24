/*
  Warnings:

  - You are about to drop the `DCFModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DCFProjection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DCFProjection" DROP CONSTRAINT "DCFProjection_dcfModelId_fkey";

-- DropTable
DROP TABLE "DCFModel";

-- DropTable
DROP TABLE "DCFProjection";

-- CreateTable
CREATE TABLE "DCF" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revenue2024" DOUBLE PRECISION NOT NULL,
    "cogs2024" DOUBLE PRECISION NOT NULL,
    "sgna2024" DOUBLE PRECISION NOT NULL,
    "rnd2024" DOUBLE PRECISION NOT NULL,
    "shareCount" DOUBLE PRECISION NOT NULL,
    "commercialGrowthRates" JSONB NOT NULL,
    "governmentGrowthRates" JSONB NOT NULL,
    "grossMargins" JSONB NOT NULL,
    "rndRates" JSONB NOT NULL,
    "sgnaRates" JSONB NOT NULL,
    "taxRates" JSONB NOT NULL,
    "daRates" JSONB NOT NULL,
    "capexRates" JSONB NOT NULL,
    "nwcRates" JSONB NOT NULL,
    "wacc" DOUBLE PRECISION NOT NULL,
    "perpGrowthRate" DOUBLE PRECISION NOT NULL,
    "exitMultiple" DOUBLE PRECISION NOT NULL,
    "cashBalance" DOUBLE PRECISION NOT NULL,
    "debt" DOUBLE PRECISION NOT NULL,
    "sharePrice" DOUBLE PRECISION NOT NULL,
    "perpPrice" DOUBLE PRECISION NOT NULL,
    "exitMultiplePrice" DOUBLE PRECISION NOT NULL,
    "projectedRevenues" JSONB NOT NULL,
    "projectedEBIT" JSONB NOT NULL,
    "projectedFreeCashFlows" JSONB NOT NULL,
    "terminalValue" DOUBLE PRECISION NOT NULL,
    "terminalValueExitMultiple" DOUBLE PRECISION NOT NULL,
    "enterpriseValue" DOUBLE PRECISION NOT NULL,
    "enterpriseValueExitMultiple" DOUBLE PRECISION NOT NULL,
    "equityValue" DOUBLE PRECISION NOT NULL,
    "equityValueExitMultiple" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DCF_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DCF_createdAt_idx" ON "DCF"("createdAt");
