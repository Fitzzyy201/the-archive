-- CreateTable
CREATE TABLE `ulasan` (
    `id_ulasan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_buyer` INTEGER NOT NULL,
    `id_produk` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `komentar` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_ulasan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ulasan` ADD CONSTRAINT `ulasan_id_buyer_fkey` FOREIGN KEY (`id_buyer`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ulasan` ADD CONSTRAINT `ulasan_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;
