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
-- Table structure for table `ItemList`
--

DROP TABLE IF EXISTS `ItemList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ItemList` (
  `ListID` int NOT NULL AUTO_INCREMENT,
  `OwnerID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `SoldDate` date NOT NULL,
  `Deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`ListID`),
  KEY `OwnerID` (`OwnerID`),
  CONSTRAINT `itemlist_ibfk_1` FOREIGN KEY (`OwnerID`) REFERENCES `Members` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ItemList`
--

LOCK TABLES `ItemList` WRITE;
/*!40000 ALTER TABLE `ItemList` DISABLE KEYS */;
INSERT INTO `ItemList` VALUES (3,'owner@gmail.com','2020-01-29',NULL),(4,'owner@gmail.com','2020-01-30',NULL),(5,'owner@gmail.com','2020-01-28',NULL),(6,'owner@gmail.com','2020-02-12',NULL),(7,'owner@gmail.com','2020-02-13',NULL),(8,'owner@gmail.com','2020-02-13',NULL),(9,'owner@gmail.com','2020-02-13',NULL),(10,'owner@gmail.com','2020-02-13',NULL),(11,'owner@gmail.com','2020-02-13',NULL),(12,'owner@gmail.com','2020-02-13',NULL),(13,'owner@gmail.com','2020-02-13',NULL),(14,'owner@gmail.com','2020-02-13',NULL),(15,'owner@gmail.com','2020-02-13',NULL),(16,'owner@gmail.com','2020-02-13',NULL),(17,'owner@gmail.com','2020-02-13',NULL),(18,'owner@gmail.com','2020-02-13',NULL),(19,'owner@gmail.com','2020-02-13',NULL),(20,'owner@gmail.com','2020-02-13',NULL),(21,'owner@gmail.com','2020-02-13',NULL),(22,'owner@gmail.com','2020-02-13',NULL),(23,'owner@gmail.com','2020-02-13',NULL),(24,'owner@gmail.com','2020-02-13',NULL),(25,'owner@gmail.com','2020-02-13',NULL),(26,'owner@gmail.com','2020-02-14',NULL),(27,'owner@gmail.com','2020-02-17',NULL),(28,'owner@gmail.com','2020-02-17',NULL),(29,'owner@gmail.com','2020-02-17',NULL),(30,'owner@gmail.com','2020-02-17',NULL),(31,'owner@gmail.com','2020-02-17',NULL),(32,'owner@gmail.com','2020-02-17',NULL),(33,'owner@gmail.com','2020-02-17',NULL),(34,'owner@gmail.com','2020-02-17',NULL),(35,'owner@gmail.com','2020-02-17',NULL),(36,'owner@gmail.com','2020-02-17',NULL),(37,'owner@gmail.com','2020-02-17',NULL),(38,'owner@gmail.com','2020-02-17',NULL),(39,'owner@gmail.com','2020-02-19','2020-02-19 18:14:00');
/*!40000 ALTER TABLE `ItemList` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-02-26 19:24:02
