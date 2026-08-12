/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user` table. All the data in the column will be lost.
  - Added the required column `id_user` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noTelp` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `fotoProfil` VARCHAR(191) NULL,
    ADD COLUMN `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `noTelp` VARCHAR(191) NOT NULL,
    ADD COLUMN `statusAkun` BOOLEAN NOT NULL DEFAULT true,
    ADD PRIMARY KEY (`id_user`);

-- CreateTable
CREATE TABLE `TokoSeller` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaToko` VARCHAR(191) NOT NULL,
    `kota` VARCHAR(191) NOT NULL,
    `noTelp` VARCHAR(191) NOT NULL,
    `noRekening` VARCHAR(191) NOT NULL,
    `fotoKtp` VARCHAR(191) NOT NULL,
    `fotoSkck` VARCHAR(191) NOT NULL,
    `statusVerifikasi` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `alasanPenolakan` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    `diperiksaOlehId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TokoSeller_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaProduk` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `harga` INTEGER NOT NULL,
    `stok` INTEGER NOT NULL,
    `ukuranDimensi` VARCHAR(191) NOT NULL,
    `fotoProduk` VARCHAR(191) NOT NULL,
    `defect` BOOLEAN NOT NULL,
    `statusProduk` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF',
    `tokoId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlamatPengiriman` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaPenerima` VARCHAR(191) NOT NULL,
    `noTelpPenerima` VARCHAR(191) NOT NULL,
    `kotaPenerima` VARCHAR(191) NOT NULL,
    `alamatLengkap` VARCHAR(191) NOT NULL,
    `catatanKurir` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `qty` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `produkId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cart_userId_produkId_key`(`userId`, `produkId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kodeTransaksi` VARCHAR(191) NOT NULL,
    `totalHarga` INTEGER NOT NULL,
    `ongkir` INTEGER NOT NULL,
    `biayaAdmin` INTEGER NOT NULL,
    `totalBayar` INTEGER NOT NULL,
    `metodePembayaran` VARCHAR(191) NOT NULL,
    `status` ENUM('MENUNGGU_PEMBAYARAN', 'DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN') NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
    `buyerId` INTEGER NOT NULL,
    `alamatId` INTEGER NOT NULL,
    `snapToken` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transaksi_kodeTransaksi_key`(`kodeTransaksi`),
    UNIQUE INDEX `Transaksi_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailTransaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `qty` INTEGER NOT NULL,
    `harga` INTEGER NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `transaksiId` INTEGER NOT NULL,
    `produkId` INTEGER NOT NULL,
    `namaProduk` VARCHAR(191) NOT NULL,
    `fotoProduk` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Komplain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alasanKomplain` VARCHAR(191) NOT NULL,
    `buktiUrl` VARCHAR(191) NOT NULL,
    `status` ENUM('MENUNGGU', 'DIPROSES', 'DITERIMA', 'DITOLAK', 'SELESAI') NOT NULL DEFAULT 'MENUNGGU',
    `keputusanAdmin` VARCHAR(191) NULL,
    `transaksiId` INTEGER NOT NULL,
    `adminId` INTEGER NULL,
    `balasanSeller` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Komplain_transaksiId_key`(`transaksiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogKeuangan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenis` ENUM('PEMBAYARAN', 'PENCAIRAN', 'REFUND', 'POTONGAN_ADMIN') NOT NULL,
    `nominal` INTEGER NOT NULL,
    `transaksiId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ulasan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `komentar` VARCHAR(191) NULL,
    `buyerId` INTEGER NOT NULL,
    `produkId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TokoSeller` ADD CONSTRAINT `TokoSeller_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TokoSeller` ADD CONSTRAINT `TokoSeller_diperiksaOlehId_fkey` FOREIGN KEY (`diperiksaOlehId`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produk` ADD CONSTRAINT `Produk_tokoId_fkey` FOREIGN KEY (`tokoId`) REFERENCES `TokoSeller`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlamatPengiriman` ADD CONSTRAINT `AlamatPengiriman_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_alamatId_fkey` FOREIGN KEY (`alamatId`) REFERENCES `AlamatPengiriman`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_transaksiId_fkey` FOREIGN KEY (`transaksiId`) REFERENCES `Transaksi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komplain` ADD CONSTRAINT `Komplain_transaksiId_fkey` FOREIGN KEY (`transaksiId`) REFERENCES `Transaksi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komplain` ADD CONSTRAINT `Komplain_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogKeuangan` ADD CONSTRAINT `LogKeuangan_transaksiId_fkey` FOREIGN KEY (`transaksiId`) REFERENCES `Transaksi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogKeuangan` ADD CONSTRAINT `LogKeuangan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ulasan` ADD CONSTRAINT `Ulasan_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ulasan` ADD CONSTRAINT `Ulasan_produkId_fkey` FOREIGN KEY (`produkId`) REFERENCES `Produk`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
