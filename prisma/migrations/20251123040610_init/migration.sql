-- CreateTable
CREATE TABLE "DCFModel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dilutedSharesOutstanding" DOUBLE PRECISION NOT NULL,
    "wacc" DOUBLE PRECISION NOT NULL,
    "debtBalance" DOUBLE PRECISION NOT NULL,
    "cashBalance" DOUBLE PRECISION NOT NULL,
    "perpetuityGrowthRate" DOUBLE PRECISION,
    "exitMultiple" DOUBLE PRECISION,
    "ltmRevenue" DOUBLE PRECISION NOT NULL,
    "ltmCogs" DOUBLE PRECISION NOT NULL,
    "ltmSgAndA" DOUBLE PRECISION NOT NULL,
    "ltmRAndD" DOUBLE PRECISION NOT NULL,
    "pvOfFcfs" DOUBLE PRECISION NOT NULL,
    "enterpriseValue" DOUBLE PRECISION NOT NULL,
    "equityValue" DOUBLE PRECISION NOT NULL,
    "sharePrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DCFModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DCFProjection" (
    "id" TEXT NOT NULL,
    "dcfModelId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "cogsMargin" DOUBLE PRECISION NOT NULL,
    "sgAndAMargin" DOUBLE PRECISION NOT NULL,
    "rAndDMargin" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "daAsPercentOfRevenue" DOUBLE PRECISION NOT NULL,
    "capexAsPercentOfRevenue" DOUBLE PRECISION NOT NULL,
    "nwcChangeAsPercentOfRevenue" DOUBLE PRECISION NOT NULL,
    "totalProjectedRevenue" DOUBLE PRECISION NOT NULL,
    "freeCashFlow" DOUBLE PRECISION NOT NULL,
    "presentValueOfFcf" DOUBLE PRECISION NOT NULL,
    "ebitda" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DCFProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DCFSegment" (
    "id" TEXT NOT NULL,
    "dcfModelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "growthYear1" DOUBLE PRECISION NOT NULL,
    "growthYear2" DOUBLE PRECISION NOT NULL,
    "growthYear3" DOUBLE PRECISION NOT NULL,
    "growthYear4" DOUBLE PRECISION NOT NULL,
    "growthYear5" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DCFSegment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DCFProjection" ADD CONSTRAINT "DCFProjection_dcfModelId_fkey" FOREIGN KEY ("dcfModelId") REFERENCES "DCFModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DCFSegment" ADD CONSTRAINT "DCFSegment_dcfModelId_fkey" FOREIGN KEY ("dcfModelId") REFERENCES "DCFModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
