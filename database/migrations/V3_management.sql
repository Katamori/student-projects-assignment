-- CREATE TABLE "management" -----------------------------------
CREATE TABLE `management`( 
	`id` Int( 11 ) AUTO_INCREMENT NOT NULL,
	`student_id` Int( 11 ) NOT NULL,
	`project_id` Int( 11 ) NOT NULL,
	`createdAt` DateTime NULL,
	`updatedAt` DateTime NULL,
	CONSTRAINT `unique_id` UNIQUE( `id` ),
    PRIMARY KEY ( `id` )
);

CREATE INDEX `index_student_id` ON `management`( `student_id` );
CREATE INDEX `index_project_id` ON `management`( `project_id` );

ALTER TABLE `management` ADD UNIQUE `unique_pair`(`student_id`, `project_id`);

ALTER TABLE `management`
	ADD CONSTRAINT `lnk_students_management` FOREIGN KEY ( `student_id` )
	REFERENCES `students`( `id` )
	ON DELETE Restrict
	ON UPDATE Cascade;

ALTER TABLE `management`
	ADD CONSTRAINT `lnk_projects_management` FOREIGN KEY ( `project_id` )
	REFERENCES `projects`( `id` )
	ON DELETE Restrict
	ON UPDATE Cascade;
-- -------------------------------------------------------------