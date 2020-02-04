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
-- Table structure for table `Timeline`
--

DROP TABLE IF EXISTS `Timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Timeline` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `RouteID` int NOT NULL,
  `RunDate` date NOT NULL,
  `BusID` int NOT NULL,
  `DriverID` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `PTID` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `ListID` int NOT NULL,
  `ActionID` int NOT NULL,
  `Lat` double DEFAULT NULL,
  `Lng` double DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `ListID` (`ListID`),
  KEY `RouteID` (`RouteID`),
  KEY `BusID` (`BusID`),
  KEY `DriverID` (`DriverID`),
  KEY `PTID` (`PTID`),
  KEY `ActionID` (`ActionID`),
  CONSTRAINT `timeline_ibfk_1` FOREIGN KEY (`ListID`) REFERENCES `ItemList` (`ListID`),
  CONSTRAINT `timeline_ibfk_2` FOREIGN KEY (`RouteID`) REFERENCES `Route` (`RouteID`),
  CONSTRAINT `timeline_ibfk_3` FOREIGN KEY (`BusID`) REFERENCES `Bus` (`ID`),
  CONSTRAINT `timeline_ibfk_4` FOREIGN KEY (`DriverID`) REFERENCES `Members` (`ID`),
  CONSTRAINT `timeline_ibfk_5` FOREIGN KEY (`PTID`) REFERENCES `Members` (`ID`),
  CONSTRAINT `timeline_ibfk_6` FOREIGN KEY (`ActionID`) REFERENCES `ActionDetail` (`ActionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Timeline`
--

LOCK TABLES `Timeline` WRITE;
/*!40000 ALTER TABLE `Timeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `Timeline` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-02-04 14:57:08
