-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "totalDay" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentToken" TEXT,
ADD COLUMN     "paymentUrl" TEXT,
ALTER COLUMN "total" DROP NOT NULL,
ALTER COLUMN "paymentDate" DROP NOT NULL,
ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;
