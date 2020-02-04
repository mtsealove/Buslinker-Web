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
-- Table structure for table `route`
--

DROP TABLE IF EXISTS `route`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route` (
  `RouteID` int NOT NULL AUTO_INCREMENT,
  `CorpID` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Locations` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ContractStart` date DEFAULT NULL,
  `ContractEnd` date DEFAULT NULL,
  `Name` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `DriverID` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `BusID` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`RouteID`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route`
--

LOCK TABLES `route` WRITE;
/*!40000 ALTER TABLE `route` DISABLE KEYS */;
INSERT INTO `route` VALUES (1,'Bus@gmail.com','100,102,103,103,101,99','2020-01-28','2021-01-27','test',NULL,NULL),(2,'Bus@gmail.com','105,107,108,108,106,104','2020-01-28','2021-01-27','test','driver@gmail.com',NULL),(3,'Bus@gmail.com','110,112,113,113,111,109','2020-01-28','2021-01-27','test',NULL,NULL),(4,'Bus@gmail.com','115,117,118,118,116,114','2020-01-28','2021-01-27','test',NULL,NULL),(5,'Bus@gmail.com','120,122,123,123,121,119','2020-01-28','2021-01-27','test',NULL,NULL),(6,'Bus@gmail.com','125,127,128,128,126,124','2020-01-28','2021-01-27','test',NULL,NULL),(7,'Bus@gmail.com','130,132,133,133,131,129','2020-01-28','2021-01-27','test',NULL,NULL),(8,'Bus@gmail.com','135,137,138,138,136,134','2020-01-28','2021-01-27','test',NULL,NULL),(9,'Bus@gmail.com','140,142,143,143,141,139','2020-01-28','2021-01-27','test',NULL,NULL),(10,'Bus@gmail.com','145,147,148,148,146,144','2020-01-28','2021-01-27','test',NULL,NULL),(11,'Bus@gmail.com','150,152,153,153,151,149','2020-01-28','2021-01-27','test',NULL,NULL),(12,'Bus@gmail.com','155,157,158,158,156,154','2020-01-28','2021-01-27','test',NULL,NULL),(13,'Bus@gmail.com','160,162,163,163,161,159','2020-01-28','2021-01-27','test',NULL,NULL),(14,'Bus@gmail.com','165,167,168,168,166,164','2020-01-28','2021-01-27','test',NULL,NULL),(15,'Bus@gmail.com','190,192,193,193,191,189','2020-01-28','2021-01-27','test',NULL,NULL),(16,'Bus@gmail.com','196,198,199,199,197,195','2020-01-28','2021-01-27','test',NULL,NULL),(17,'Bus@gmail.com','202,204,205,205,203,201','2020-01-28','2021-01-27','test',NULL,NULL),(18,'Bus@gmail.com','208,210,211,211,209,207','2020-01-28','2021-01-27','test',NULL,NULL),(19,'Bus@gmail.com','214,216,217,217,215,213','2020-01-28','2021-01-27','test',NULL,NULL),(20,'Bus@gmail.com','220,222,223,223,221,219','2020-01-28','2021-01-27','test',NULL,NULL),(21,'Bus@gmail.com','232,234,235,235,233,231','2020-01-28','2021-01-27','test',NULL,NULL),(22,'Bus@gmail.com','238,240,241,241,239,237','2020-01-28','2021-01-27','test',NULL,NULL),(23,'Bus@gmail.com','244,246,247,248,245,243','2020-01-28','2021-01-27','test',NULL,NULL),(24,'Bus@gmail.com','250,252,253,254,251,249','2020-01-28','2021-01-27','test',NULL,NULL),(25,'Bus@gmail.com','256,258,259,260,257,255','2020-01-28','2021-01-27','test',NULL,NULL),(26,'Bus@gmail.com','268,270,271,272,269,267','2020-01-28','2021-01-27','test',NULL,NULL),(27,'Bus@gmail.com','274,276,277,278,275,273','2020-01-28','2021-01-27','test',NULL,NULL),(28,'Bus@gmail.com','280,282,283,284,281,279','2020-01-28','2021-01-27','tess',NULL,NULL),(29,'Bus@gmail.com','291,293,294,295,292,290','2020-01-28','2021-01-27','test',NULL,NULL),(31,'Bus@gmail.com','303,305,306,307,304,302','2020-01-29','2021-01-28','정류장-버스링커',NULL,NULL),(32,'Bus@gmail.com','309,311,312,313,310,308','2020-01-29','2021-01-28','정류장-버스링커',NULL,NULL);
/*!40000 ALTER TABLE `route` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-02-04 14:57:05
