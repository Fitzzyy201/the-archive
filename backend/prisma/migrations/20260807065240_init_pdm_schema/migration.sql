/*
  Warnings:

  - The primary key for the `cart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `produkId` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `cart` table. All the data in the column will be lost.
  - The primary key for the `komplain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adminId` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `alasanKomplain` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `balasanSeller` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `buktiUrl` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `keputusanAdmin` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `transaksiId` on the `komplain` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `komplain` table. All the data in the column will be lost.
  - The primary key for the `produk` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `fotoProduk` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `namaProduk` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `statusProduk` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `tokoId` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `ukuranDimensi` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `produk` table. All the data in the column will be lost.
  - The primary key for the `transaksi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alamatId` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `biayaAdmin` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `buyerId` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `kodeTransaksi` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `metodePembayaran` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `ongkir` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `snapToken` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `totalBayar` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `totalHarga` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `fotoProfil` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `noTelp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `statusAkun` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.
  - You are about to drop the `alamatpengiriman` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detailtransaksi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `logkeuangan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tokoseller` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ulasan` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_transaksi]` on the table `komplain` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_cart` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_produk` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alasan_komplain` to the `komplain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foto_video_bukti` to the `komplain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_komplain` to the `komplain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_transaksi` to the `komplain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foto_produk` to the `produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_produk` to the `produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_toko` to the `produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama_produk` to the `produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ukuran_dimensi` to the `produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_buyer` to the `transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_toko` to the `transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_transaksi` to the `transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_harga` to the `transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_telp` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `alamatpengiriman` DROP FOREIGN KEY `AlamatPengiriman_userId_fkey`;

-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_produkId_fkey`;

-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_userId_fkey`;

-- DropForeignKey
ALTER TABLE `detailtransaksi` DROP FOREIGN KEY `DetailTransaksi_produkId_fkey`;

-- DropForeignKey
ALTER TABLE `detailtransaksi` DROP FOREIGN KEY `DetailTransaksi_transaksiId_fkey`;

-- DropForeignKey
ALTER TABLE `komplain` DROP FOREIGN KEY `Komplain_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `komplain` DROP FOREIGN KEY `Komplain_transaksiId_fkey`;

-- DropForeignKey
ALTER TABLE `logkeuangan` DROP FOREIGN KEY `LogKeuangan_transaksiId_fkey`;

-- DropForeignKey
ALTER TABLE `logkeuangan` DROP FOREIGN KEY `LogKeuangan_userId_fkey`;

-- DropForeignKey
ALTER TABLE `produk` DROP FOREIGN KEY `Produk_tokoId_fkey`;

-- DropForeignKey
ALTER TABLE `tokoseller` DROP FOREIGN KEY `TokoSeller_diperiksaOlehId_fkey`;

-- DropForeignKey
ALTER TABLE `tokoseller` DROP FOREIGN KEY `TokoSeller_userId_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_alamatId_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_buyerId_fkey`;

-- DropForeignKey
ALTER TABLE `ulasan` DROP FOREIGN KEY `Ulasan_buyerId_fkey`;

-- DropForeignKey
ALTER TABLE `ulasan` DROP FOREIGN KEY `Ulasan_produkId_fkey`;

-- DropIndex
DROP INDEX `Cart_produkId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `Cart_userId_produkId_key` ON `cart`;

-- DropIndex
DROP INDEX `Komplain_adminId_fkey` ON `komplain`;

-- DropIndex
DROP INDEX `Komplain_transaksiId_key` ON `komplain`;

-- DropIndex
DROP INDEX `Produk_tokoId_fkey` ON `produk`;

-- DropIndex
DROP INDEX `Transaksi_alamatId_fkey` ON `transaksi`;

-- DropIndex
DROP INDEX `Transaksi_buyerId_fkey` ON `transaksi`;

-- DropIndex
DROP INDEX `Transaksi_kodeTransaksi_key` ON `transaksi`;

-- DropIndex
DROP INDEX `Transaksi_orderId_key` ON `transaksi`;

-- AlterTable
ALTER TABLE `cart` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `id`,
    DROP COLUMN `produkId`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `id_cart` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `id_produk` INTEGER NOT NULL,
    ADD COLUMN `id_user` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id_cart`);

-- AlterTable
ALTER TABLE `komplain` DROP PRIMARY KEY,
    DROP COLUMN `adminId`,
    DROP COLUMN `alasanKomplain`,
    DROP COLUMN `balasanSeller`,
    DROP COLUMN `buktiUrl`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `id`,
    DROP COLUMN `keputusanAdmin`,
    DROP COLUMN `status`,
    DROP COLUMN `transaksiId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `alasan_komplain` TEXT NOT NULL,
    ADD COLUMN `ditangani_oleh` INTEGER NULL,
    ADD COLUMN `foto_video_bukti` VARCHAR(255) NOT NULL,
    ADD COLUMN `id_komplain` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `id_transaksi` INTEGER NOT NULL,
    ADD COLUMN `keputusan_admin` TEXT NULL,
    ADD COLUMN `status_komplain` ENUM('Menunggu', 'DalamProses', 'Disetujui', 'Ditolak') NOT NULL DEFAULT 'Menunggu',
    ADD PRIMARY KEY (`id_komplain`);

-- AlterTable
ALTER TABLE `produk` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `fotoProduk`,
    DROP COLUMN `id`,
    DROP COLUMN `namaProduk`,
    DROP COLUMN `statusProduk`,
    DROP COLUMN `tokoId`,
    DROP COLUMN `ukuranDimensi`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `foto_produk` VARCHAR(255) NOT NULL,
    ADD COLUMN `id_produk` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `id_toko` INTEGER NOT NULL,
    ADD COLUMN `nama_produk` VARCHAR(150) NOT NULL,
    ADD COLUMN `status_produk` ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
    ADD COLUMN `ukuran_dimensi` VARCHAR(50) NOT NULL,
    MODIFY `deskripsi` TEXT NOT NULL,
    MODIFY `defect` BOOLEAN NOT NULL DEFAULT false,
    ADD PRIMARY KEY (`id_produk`);

-- AlterTable
ALTER TABLE `transaksi` DROP PRIMARY KEY,
    DROP COLUMN `alamatId`,
    DROP COLUMN `biayaAdmin`,
    DROP COLUMN `buyerId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `id`,
    DROP COLUMN `kodeTransaksi`,
    DROP COLUMN `metodePembayaran`,
    DROP COLUMN `ongkir`,
    DROP COLUMN `orderId`,
    DROP COLUMN `snapToken`,
    DROP COLUMN `status`,
    DROP COLUMN `totalBayar`,
    DROP COLUMN `totalHarga`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `batas_waktu_komplain` DATETIME(3) NULL,
    ADD COLUMN `batas_waktu_transaksi` DATETIME(3) NULL,
    ADD COLUMN `id_buyer` INTEGER NOT NULL,
    ADD COLUMN `id_toko` INTEGER NOT NULL,
    ADD COLUMN `id_transaksi` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `status_pesanan` ENUM('BelumBayar', 'Diproses', 'Dikirim', 'Selesai', 'Dikomplain', 'Batal') NOT NULL DEFAULT 'BelumBayar',
    ADD COLUMN `total_harga` INTEGER NOT NULL,
    ADD COLUMN `waktu_transaksi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD PRIMARY KEY (`id_transaksi`);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `fotoProfil`,
    DROP COLUMN `nama`,
    DROP COLUMN `noTelp`,
    DROP COLUMN `statusAkun`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `foto_profil` VARCHAR(255) NULL,
    ADD COLUMN `no_telp` VARCHAR(20) NOT NULL,
    ADD COLUMN `status_akun` ENUM('Aktif', 'Suspend') NOT NULL DEFAULT 'Aktif',
    MODIFY `email` VARCHAR(100) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `role` ENUM('Admin', 'Buyer', 'Seller') NOT NULL DEFAULT 'Buyer';

-- DropTable
DROP TABLE `alamatpengiriman`;

-- DropTable
DROP TABLE `detailtransaksi`;

-- DropTable
DROP TABLE `logkeuangan`;

-- DropTable
DROP TABLE `tokoseller`;

-- DropTable
DROP TABLE `ulasan`;

-- CreateTable
CREATE TABLE `toko_seller` (
    `id_toko` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `diperiksa_oleh` INTEGER NULL,
    `nama_toko` VARCHAR(100) NOT NULL,
    `kota` VARCHAR(100) NOT NULL,
    `no_hp` VARCHAR(20) NOT NULL,
    `no_rekening` VARCHAR(50) NOT NULL,
    `foto_ktp` VARCHAR(255) NOT NULL,
    `foto_skck` VARCHAR(255) NOT NULL,
    `status_verif` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `alasan_penolakan` TEXT NULL,
    `saldo_toko` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `toko_seller_id_user_key`(`id_user`),
    PRIMARY KEY (`id_toko`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alamat_pengiriman` (
    `id_alamat` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `nama_penerima` VARCHAR(100) NOT NULL,
    `kota_penerima` VARCHAR(100) NOT NULL,
    `alamat_lengkap` TEXT NOT NULL,
    `catatan_kurir` TEXT NULL,

    PRIMARY KEY (`id_alamat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_keuangan` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NULL,
    `id_user` INTEGER NOT NULL,
    `jenis_transaksi` ENUM('PencairanSeller', 'FeeAdmin', 'RefundBuyer', 'WithdrawAdmin') NOT NULL,
    `nominal` INTEGER NOT NULL,
    `waktu_log` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `komplain_id_transaksi_key` ON `komplain`(`id_transaksi`);

-- AddForeignKey
ALTER TABLE `toko_seller` ADD CONSTRAINT `toko_seller_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `toko_seller` ADD CONSTRAINT `toko_seller_diperiksa_oleh_fkey` FOREIGN KEY (`diperiksa_oleh`) REFERENCES `user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produk` ADD CONSTRAINT `produk_id_toko_fkey` FOREIGN KEY (`id_toko`) REFERENCES `toko_seller`(`id_toko`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alamat_pengiriman` ADD CONSTRAINT `alamat_pengiriman_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_buyer_fkey` FOREIGN KEY (`id_buyer`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_toko_fkey` FOREIGN KEY (`id_toko`) REFERENCES `toko_seller`(`id_toko`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `komplain` ADD CONSTRAINT `komplain_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id_transaksi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `komplain` ADD CONSTRAINT `komplain_ditangani_oleh_fkey` FOREIGN KEY (`ditangani_oleh`) REFERENCES `user`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_keuangan` ADD CONSTRAINT `log_keuangan_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id_transaksi`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_keuangan` ADD CONSTRAINT `log_keuangan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
