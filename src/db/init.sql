IF DB_ID('drivespot') IS NULL
    CREATE DATABASE drivespot;
GO

USE drivespot;
GO

IF OBJECT_ID('Searches', 'U') IS NULL
BEGIN
    CREATE TABLE Searches(
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(9,6) NOT NULL,
        label VARCHAR(64) not null,
        coordinates GEOGRAPHY NOT NULL UNIQUE      
    );
END
GO

IF OBJECT_ID('Pois', 'U') IS NULL
BEGIN
    CREATE TABLE Pois(
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        osm_type VARCHAR(5) NOT NULL
            CHECK (osm_type IN ('way', 'node')),
        osm_id INT NOT NULL,
        category VARCHAR(64) NOT NULL,
        category_label VARCHAR(64) NOT NULL,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(9,6) NOT NULL,
        source VARCHAR(64),
        CONSTRAINT UQ_Pois_OsmType_OsmId
            UNIQUE(osm_type, osm_id)     
    );
END
GO

IF OBJECT_ID('Pois_Searches', 'U') IS NULL
BEGIN
    CREATE TABLE Pois_Searches(
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_poi VARCHAR(255),
        id_search INT,
        CONSTRAINT FK_Searches_id 
            FOREIGN KEY (id_search) REFERENCES Searches(id),
        CONSTRAINT FK_Pois_id 
            FOREIGN KEY (id_poi) REFERENCES Pois(id)
    );
END
GO 