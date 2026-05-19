CREATE TABLE "pages_editoriales" (
	"slug" varchar(100) PRIMARY KEY NOT NULL,
	"titre" varchar(200) NOT NULL,
	"contenu" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
