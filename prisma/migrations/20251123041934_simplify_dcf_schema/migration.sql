/*
  Warnings:

  - You are about to drop the column `cashBalance` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `debtBalance` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `dilutedSharesOutstanding` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `enterpriseValue` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `equityValue` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `exitMultiple` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `ltmCogs` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `ltmRAndD` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `ltmRevenue` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `ltmSgAndA` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `perpetuityGrowthRate` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `pvOfFcfs` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `sharePrice` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `wacc` on the `DCFModel` table. All the data in the column will be lost.
  - You are about to drop the column `capexAsPercentOfRevenue` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `cogsMargin` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `daAsPercentOfRevenue` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `ebitda` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `freeCashFlow` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `nwcChangeAsPercentOfRevenue` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `presentValueOfFcf` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `rAndDMargin` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `sgAndAMargin` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `totalProjectedRevenue` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `DCFProjection` table. All the data in the column will be lost.
  - You are about to drop the `DCFSegment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sumOfPresentValue` to the `DCFModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capitalExpenditures` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changesInNWC` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `depreciationAndAmortization` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountFactor` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ebit` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fiscalYearEndDate` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentValueOfUFCF` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxExpense` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unleveredFreeCashFlow` to the `DCFProjection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DCFProjection" DROP CONSTRAINT "DCFProjection_dcfModelId_fkey";

-- DropForeignKey
ALTER TABLE "DCFSegment" DROP CONSTRAINT "DCFSegment_dcfModelId_fkey";

-- AlterTable
ALTER TABLE "DCFModel" DROP COLUMN "cashBalance",
DROP COLUMN "debtBalance",
DROP COLUMN "dilutedSharesOutstanding",
DROP COLUMN "enterpriseValue",
DROP COLUMN "equityValue",
DROP COLUMN "exitMultiple",
DROP COLUMN "ltmCogs",
DROP COLUMN "ltmRAndD",
DROP COLUMN "ltmRevenue",
DROP COLUMN "ltmSgAndA",
DROP COLUMN "perpetuityGrowthRate",
DROP COLUMN "pvOfFcfs",
DROP COLUMN "sharePrice",
DROP COLUMN "wacc",
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "sumOfPresentValue" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "DCFProjection" DROP COLUMN "capexAsPercentOfRevenue",
DROP COLUMN "cogsMargin",
DROP COLUMN "daAsPercentOfRevenue",
DROP COLUMN "ebitda",
DROP COLUMN "freeCashFlow",
DROP COLUMN "nwcChangeAsPercentOfRevenue",
DROP COLUMN "presentValueOfFcf",
DROP COLUMN "rAndDMargin",
DROP COLUMN "sgAndAMargin",
DROP COLUMN "taxRate",
DROP COLUMN "totalProjectedRevenue",
DROP COLUMN "year",
ADD COLUMN     "capitalExpenditures" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "changesInNWC" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "depreciationAndAmortization" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "discountFactor" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ebit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fiscalYearEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "presentValueOfUFCF" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "taxExpense" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unleveredFreeCashFlow" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "DCFSegment";

-- AddForeignKey
ALTER TABLE "DCFProjection" ADD CONSTRAINT "DCFProjection_dcfModelId_fkey" FOREIGN KEY ("dcfModelId") REFERENCES "DCFModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
