-- CREATE TABLE "projects" -------------------------------------
CREATE TABLE IF NOT EXISTS `projects`( 
	`id` Int( 11 ) UNSIGNED AUTO_INCREMENT NOT NULL,
	`name` VarChar( 128 ) NOT NULL,
	`description` VarChar( 255 ) NOT NULL,
	`createdAt` DateTime NULL,
	`updatedAt` DateTime NULL,
	CONSTRAINT `unique_id` UNIQUE( `id` ),
	CONSTRAINT `unique_name` UNIQUE( `name` ),
    PRIMARY KEY ( `id` )
)
-- -------------------------------------------------------------
