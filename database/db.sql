CREATE DATABASE IF NOT EXISTS `nft_creator`;

USE `nft_creator`;

CREATE TABLE `users`(
    id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(16) NOT NULL,
    password VARCHAR(60) NOT NULL,
    fullName VARCHAR(100) NOT NULL,
);

ALTER TABLE `users`
    ADD PRIMARY KEY (`id`);

DESCRIBE `users`;