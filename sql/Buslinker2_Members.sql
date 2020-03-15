-- MySQL dump 10.13  Distrib 8.0.17, for macos10.14 (x86_64)
--
-- Host: 127.0.0.1    Database: Buslinker2
-- ------------------------------------------------------
-- Server version	8.0.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Members`
--

DROP TABLE IF EXISTS `Members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Members` (
  `Name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Password` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `MemberCat` int NOT NULL,
  `Phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ProfilePath` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Corp` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BizNum` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BizAddr` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BizClass` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CenterAddr` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DefaultFee` int DEFAULT NULL,
  `AdFee` int DEFAULT NULL,
  `Garage` int DEFAULT NULL,
  `BusID` int DEFAULT NULL,
  `LicensePath` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DefaultCnt` int DEFAULT NULL,
  `Token` varchar(240) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `QR` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Commute` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `MemberCat` (`MemberCat`),
  KEY `Corp` (`Corp`),
  CONSTRAINT `members_ibfk_1` FOREIGN KEY (`MemberCat`) REFERENCES `MemberCat` (`CatID`),
  CONSTRAINT `members_ibfk_2` FOREIGN KEY (`Corp`) REFERENCES `Members` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Members`
--

LOCK TABLES `Members` WRITE;
/*!40000 ALTER TABLE `Members` DISABLE KEYS */;
INSERT INTO `Members` VALUES ('버스사0','Bus@gmail.com','w3h61HLECK+Ka2ZGd9D4kQ==',2,'010-1111-2222','crop.png',NULL,'5761401124','서울특별시 마포구 마포대로 34, 9층 ','택배업','서울시 광진구 자양로 117',6000000,2000,NULL,NULL,NULL,2000,NULL,NULL,NULL),('기사0','driver0@gmail.com','w3h61HLECK+Ka2ZGd9D4kQ==',6,'010-1111-2222','crop.png','Bus@gmail.com',NULL,NULL,NULL,NULL,6000000,2000,NULL,-1,'public/uploads/08bd6a425bb7e77638af4d7dd914b109',2000,NULL,NULL,NULL),('기사1','driver@gmail.com','w3h61HLECK+Ka2ZGd9D4kQ==',6,'010-1111-1122','crop.png','Bus@gmail.com',NULL,NULL,NULL,'서울시 광진구 자양로 117',6000000,2000,NULL,3,'public/uploads/d2ca5f43642e41ea0d369fb41c4c82f9',2000,'cri-3dLdpOo:APA91bHKEJk1gutoqloNVunvy0WxGjHCKZnAdOgkSL5DCEYPCVtHbyzshO1lgHK62KLhpkQhJj66J1l5bk9ed5YRm-aE9dHqt9k-bcgybShis00kQC_zikOgNI8_FMsfvuRWGku4OArF',NULL,1),('물류사','logi@gmail.com','w3h61HLECK+Ka2ZGd9D4kQ==',4,'010-1111-1111','crop.png',NULL,'5761401124','서울특별시 마포구 마포대로 34, 9층 ','택배업','서울시 광진구 자양로 117',6000000,2000,NULL,NULL,NULL,2000,NULL,NULL,NULL),('버스링커','maasdf@gami.com','w3h61HLECK+Ka2ZGd9D4kQ==',4,'020-2222-2222','crop.png',NULL,'5761401124','서울특별시 마포구 마포대로 34, 9층 ','택배업','서울시 광진구 자양로 117',6000000,2000,NULL,NULL,NULL,2000,NULL,NULL,NULL),('이산해','mtsealove','w3h61HLECK+Ka2ZGd9D4kQ==',1,'010-6346-1686','crop.png',NULL,NULL,NULL,NULL,'서울시 광진구 자양로 117',6000000,2000,NULL,NULL,NULL,2000,NULL,NULL,NULL),('이산해','mtsealove0927@gmail.com','nWId8Iv4wr9Ed4OItCvEFw==',6,'010-1111-2222','crop.png','Bus@gmail.com',NULL,NULL,NULL,NULL,6000000,2000,NULL,-1,'public/uploads/08bd6a425bb7e77638af4d7dd914b109',2000,NULL,NULL,NULL),('버스링커','mtsealove@gmail.com','w3h61HLECK+Ka2ZGd9D4kQ==',4,'010-1111-2222','crop.png',NULL,'5761401124','서울특별시 마포구 마포대로 34, 9층 ','택배업','서울시 광진구 자양로 117',6000000,2000,NULL,NULL,NULL,2000,NULL,NULL,NULL),('화주사','owner@gmail.com','w3h61HLECK+Ka2ZGd9D4kQ==',3,'010-1111-2222','crop.png','logi@gmail.com','5761401124','서울특별시 마포구 마포대로 34, 9층 ','택배업','서울시 광진구 자양로 117',6000000,2000,NULL,NULL,NULL,2000,NULL,NULL,NULL),('조성호','test@gmail.com','w3h61HLECK+Ka2ZGd9D4kQ==',5,'010-1111-2222','crop.png',NULL,'5761401124','서울특별시 마포구 마포대로 34, 9층 ','택배업','서울시 광진구 자양로 117',6000000,2000,1,NULL,NULL,2000,'d3zcJDW7k0Q2s3TlTN3Y-b:APA91bEfoZze8wSPxlJ2v21wC_bmd3mdIqL_Aq_c1Bp7Ur7zwELAr27_05LRzWFrMJird0Q9_vRQ9rqeMa3ftJLMeSfGpBZY-iW29lIRFMca4-8og-Ll8pBTDM6yAV4YhWeRUgEXwvYh',NULL,1);
/*!40000 ALTER TABLE `Members` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-03-15 16:56:08
