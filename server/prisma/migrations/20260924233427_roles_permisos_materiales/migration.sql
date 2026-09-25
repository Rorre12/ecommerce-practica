-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('PRODUCTS', 'ORDERS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'unidad';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "permissions" "Permission"[] DEFAULT ARRAY[]::"Permission"[],
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- Los usuarios que existían antes de esta migración conservan el acceso
UPDATE "users" SET "status" = 'APPROVED';
