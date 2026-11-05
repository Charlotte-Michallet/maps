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
        coordinates VARCHAR(255) NOT NULL UNIQUE      
    );
END
GO

IF OBJECT_ID('Clusters', 'U') IS NULL
BEGIN
    CREATE TABLE Clusters(
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(9,6) NOT NULL,
        category_count INT NOT NULL,
        count INT NOT NULL,
        id_search INT NOT NULL,
        CONSTRAINT FK_Clusters_Searches_id
            FOREIGN KEY (id_search) REFERENCES Searches(id)
    )
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
        id_cluster VARCHAR(255),
        CONSTRAINT FK_Pois_Clusters_id
            FOREIGN KEY (id_cluster) REFERENCES Clusters(id),
        CONSTRAINT UQ_Pois_OsmType_OsmId
            UNIQUE(osm_type, osm_id)
    );
END
GO

IF OBJECT_ID('Tags', 'U') IS NULL
BEGIN
    CREATE TABLE Tags(
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        type VARCHAR(64) NOT NULL,
        value VARCHAR(64) NOT NULL,
        CONSTRAINT UQ_Tags_Type_Value
            UNIQUE (type, value)
    )
END
GO

IF OBJECT_ID('Tags_Pois', 'U') IS NULL
BEGIN
    CREATE TABLE Tags_Pois(
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_tag INT NOT NULL,
        id_poi VARCHAR(255) NOT NULL,
        CONSTRAINT FK_Tags_Pois_Pois_id
            FOREIGN KEY (id_poi) REFERENCES Pois(id),
        CONSTRAINT FK_Tags_Pois_Tags_id
            FOREIGN KEY (id_tag) REFERENCES Tags(id)
    )
END
GO

IF OBJECT_ID('Pois_Searches', 'U') IS NULL
BEGIN
    CREATE TABLE Pois_Searches(
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        id_poi VARCHAR(255) NOT NULL,
        id_search INT NOT NULL,
        CONSTRAINT FK_Pois_Searches_Searches_id 
            FOREIGN KEY (id_search) REFERENCES Searches(id),
        CONSTRAINT FK_Pois_Searches_Pois_id 
            FOREIGN KEY (id_poi) REFERENCES Pois(id)
    )
END
GO 