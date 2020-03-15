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
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ItemList`
--

LOCK TABLES `ItemList` WRITE;
/*!40000 ALTER TABLE `ItemList` DISABLE KEYS */;
INSERT INTO `ItemList` VALUES (3,'owner@gmail.com','2020-01-29',NULL),(4,'owner@gmail.com','2020-01-30',NULL),(5,'owner@gmail.com','2020-01-28',NULL),(6,'owner@gmail.com','2020-02-12',NULL),(7,'owner@gmail.com','2020-02-13',NULL),(8,'owner@gmail.com','2020-02-13',NULL),(9,'owner@gmail.com','2020-02-13',NULL),(10,'owner@gmail.com','2020-02-13',NULL),(11,'owner@gmail.com','2020-02-13',NULL),(12,'owner@gmail.com','2020-02-13',NULL),(13,'owner@gmail.com','2020-02-13',NULL),(14,'owner@gmail.com','2020-02-13',NULL),(15,'owner@gmail.com','2020-02-13',NULL),(16,'owner@gmail.com','2020-02-13',NULL),(17,'owner@gmail.com','2020-02-13',NULL),(18,'owner@gmail.com','2020-02-13',NULL),(19,'owner@gmail.com','2020-02-13',NULL),(20,'owner@gmail.com','2020-02-13',NULL),(21,'owner@gmail.com','2020-02-13',NULL),(22,'owner@gmail.com','2020-02-13',NULL),(23,'owner@gmail.com','2020-02-13',NULL),(24,'owner@gmail.com','2020-02-13',NULL),(25,'owner@gmail.com','2020-02-13',NULL),(26,'owner@gmail.com','2020-02-14',NULL),(27,'owner@gmail.com','2020-02-17',NULL),(28,'owner@gmail.com','2020-02-17',NULL),(29,'owner@gmail.com','2020-02-17',NULL),(30,'owner@gmail.com','2020-02-17',NULL),(31,'owner@gmail.com','2020-02-17',NULL),(32,'owner@gmail.com','2020-02-17',NULL),(33,'owner@gmail.com','2020-02-17',NULL),(34,'owner@gmail.com','2020-02-17',NULL),(35,'owner@gmail.com','2020-02-17',NULL),(36,'owner@gmail.com','2020-02-17',NULL),(37,'owner@gmail.com','2020-02-17',NULL),(38,'owner@gmail.com','2020-02-17',NULL),(39,'owner@gmail.com','2020-02-19','2020-02-19 18:14:00'),(40,'owner@gmail.com','2020-02-28','2020-02-28 17:26:00'),(41,'owner@gmail.com','2020-03-01','2020-03-01 19:12:00'),(42,'owner@gmail.com','2020-03-02','2020-03-02 17:36:00'),(43,'owner@gmail.com','2020-03-03','2020-03-03 18:46:00'),(44,'owner@gmail.com','2020-03-03','2020-03-03 18:49:00'),(45,'owner@gmail.com','2020-03-04','2020-03-04 14:55:00'),(46,'logi@gmail.com','2020-03-10',NULL),(47,'logi@gmail.com','2020-03-10',NULL),(48,'logi@gmail.com','2020-03-10',NULL),(49,'logi@gmail.com','2020-03-10',NULL),(50,'logi@gmail.com','2020-03-10',NULL),(51,'logi@gmail.com','2020-03-10',NULL),(52,'logi@gmail.com','2020-03-10',NULL),(53,'logi@gmail.com','2020-03-10',NULL),(54,'logi@gmail.com','2020-03-10',NULL),(55,'logi@gmail.com','2020-03-10',NULL),(56,'logi@gmail.com','2020-03-10',NULL),(57,'logi@gmail.com','2020-03-10',NULL),(58,'logi@gmail.com','2020-03-10',NULL),(59,'logi@gmail.com','2020-03-10',NULL),(60,'logi@gmail.com','2020-03-10',NULL),(61,'logi@gmail.com','2020-03-10',NULL),(62,'logi@gmail.com','2020-03-10',NULL),(63,'logi@gmail.com','2020-03-10',NULL),(64,'logi@gmail.com','2020-03-10',NULL),(65,'logi@gmail.com','2020-03-10',NULL),(66,'logi@gmail.com','2020-03-10',NULL),(67,'logi@gmail.com','2020-03-10',NULL),(68,'logi@gmail.com','2020-03-10',NULL),(69,'logi@gmail.com','2020-03-10',NULL),(70,'logi@gmail.com','2020-03-10',NULL),(71,'logi@gmail.com','2020-03-10',NULL),(72,'logi@gmail.com','2020-03-10',NULL),(73,'logi@gmail.com','2020-03-10',NULL),(74,'logi@gmail.com','2020-03-10',NULL),(75,'logi@gmail.com','2020-03-10',NULL),(76,'logi@gmail.com','2020-03-10',NULL),(77,'logi@gmail.com','2020-03-10',NULL),(78,'logi@gmail.com','2020-03-10',NULL),(79,'logi@gmail.com','2020-03-10',NULL),(80,'logi@gmail.com','2020-03-11',NULL),(81,'logi@gmail.com','2020-03-11',NULL),(82,'logi@gmail.com','2020-03-11',NULL),(83,'logi@gmail.com','2020-03-11',NULL),(84,'logi@gmail.com','2020-03-11',NULL),(85,'logi@gmail.com','2020-03-11',NULL),(86,'logi@gmail.com','2020-03-11',NULL),(87,'logi@gmail.com','2020-03-11',NULL),(88,'logi@gmail.com','2020-03-11',NULL),(89,'logi@gmail.com','2020-03-11',NULL),(90,'logi@gmail.com','2020-03-11',NULL),(91,'logi@gmail.com','2020-03-11',NULL),(92,'logi@gmail.com','2020-03-11',NULL),(93,'logi@gmail.com','2020-03-11',NULL),(94,'logi@gmail.com','2020-03-11',NULL),(95,'logi@gmail.com','2020-03-11',NULL),(96,'logi@gmail.com','2020-03-11',NULL),(97,'logi@gmail.com','2020-03-11',NULL),(98,'logi@gmail.com','2020-03-11',NULL),(99,'logi@gmail.com','2020-03-11',NULL),(100,'logi@gmail.com','2020-03-11',NULL),(101,'logi@gmail.com','2020-03-11',NULL),(102,'logi@gmail.com','2020-03-11',NULL),(103,'logi@gmail.com','2020-03-11',NULL),(104,'logi@gmail.com','2020-03-11',NULL),(105,'logi@gmail.com','2020-03-11',NULL),(106,'logi@gmail.com','2020-03-11',NULL),(107,'logi@gmail.com','2020-03-11',NULL),(108,'logi@gmail.com','2020-03-11',NULL),(109,'logi@gmail.com','2020-03-11',NULL),(110,'logi@gmail.com','2020-03-11',NULL),(111,'logi@gmail.com','2020-03-11',NULL),(112,'logi@gmail.com','2020-03-11',NULL),(113,'logi@gmail.com','2020-03-11',NULL),(114,'logi@gmail.com','2020-03-11',NULL),(115,'logi@gmail.com','2020-03-11',NULL),(116,'logi@gmail.com','2020-03-11',NULL),(117,'logi@gmail.com','2020-03-11',NULL),(118,'logi@gmail.com','2020-03-11',NULL),(119,'logi@gmail.com','2020-03-11',NULL),(120,'logi@gmail.com','2020-03-11',NULL),(121,'logi@gmail.com','2020-03-11',NULL),(122,'logi@gmail.com','2020-03-11',NULL),(123,'logi@gmail.com','2020-03-11',NULL),(124,'logi@gmail.com','2020-03-11',NULL),(125,'logi@gmail.com','2020-03-11',NULL),(126,'logi@gmail.com','2020-03-11',NULL),(127,'logi@gmail.com','2020-03-11',NULL),(128,'logi@gmail.com','2020-03-11',NULL),(129,'logi@gmail.com','2020-03-11',NULL),(130,'logi@gmail.com','2020-03-11',NULL),(131,'logi@gmail.com','2020-03-11',NULL),(132,'logi@gmail.com','2020-03-11',NULL),(133,'logi@gmail.com','2020-03-12',NULL),(134,'logi@gmail.com','2020-03-12',NULL),(135,'logi@gmail.com','2020-03-12',NULL),(136,'logi@gmail.com','2020-03-12',NULL),(137,'logi@gmail.com','2020-03-12',NULL),(138,'logi@gmail.com','2020-03-12',NULL),(139,'logi@gmail.com','2020-03-12',NULL),(140,'logi@gmail.com','2020-03-12',NULL),(141,'logi@gmail.com','2020-03-12',NULL),(142,'logi@gmail.com','2020-03-12',NULL),(143,'logi@gmail.com','2020-03-12',NULL),(144,'logi@gmail.com','2020-03-11',NULL),(145,'logi@gmail.com','2020-03-11',NULL),(146,'logi@gmail.com','2020-03-11',NULL),(147,'logi@gmail.com','2020-03-11',NULL),(148,'logi@gmail.com','2020-03-13',NULL),(149,'logi@gmail.com','2020-03-13',NULL),(150,'logi@gmail.com','2020-03-13',NULL),(151,'logi@gmail.com','2020-03-13',NULL),(152,'logi@gmail.com','2020-03-13',NULL),(153,'logi@gmail.com','2020-03-13',NULL),(154,'logi@gmail.com','2020-03-13',NULL),(155,'logi@gmail.com','2020-03-13',NULL),(156,'logi@gmail.com','2020-03-13',NULL),(157,'logi@gmail.com','2020-03-13',NULL),(158,'logi@gmail.com','2020-03-13',NULL);
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

-- Dump completed on 2020-03-15 16:56:14
