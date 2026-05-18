CREATE TYPE "public"."arrosage_plante" AS ENUM('rare', 'modere', 'regulier', 'abondant');--> statement-breakpoint
CREATE TYPE "public"."avis_type" AS ENUM('livre', 'plante');--> statement-breakpoint
CREATE TYPE "public"."difficulte_plante" AS ENUM('facile', 'moyen', 'difficile');--> statement-breakpoint
CREATE TYPE "public"."lumiere_plante" AS ENUM('ombre', 'mi-ombre', 'lumiere-vive', 'plein-soleil');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(200) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "avis" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "avis_type" NOT NULL,
	"livre_id" integer,
	"plante_id" integer,
	"auteur_nom" varchar(100) NOT NULL,
	"note" integer NOT NULL,
	"texte" text,
	"approuve" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "genres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "livres" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"titre" varchar(300) NOT NULL,
	"auteur" varchar(200) NOT NULL,
	"isbn" varchar(20),
	"genre_id" integer,
	"prix" numeric(8, 2) NOT NULL,
	"description" text,
	"images" text[],
	"note_moyenne" numeric(3, 2),
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "livres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "plantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"nom" varchar(200) NOT NULL,
	"espece" varchar(200),
	"famille" varchar(200),
	"prix" numeric(8, 2) NOT NULL,
	"description" text,
	"conseils_entretien" text,
	"difficulte" "difficulte_plante",
	"lumiere" "lumiere_plante",
	"arrosage" "arrosage_plante",
	"images" text[],
	"note_moyenne" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plantes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "selection_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"selection_id" integer NOT NULL,
	"type" "avis_type" NOT NULL,
	"livre_id" integer,
	"plante_id" integer,
	"ordre" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"titre" varchar(200) NOT NULL,
	"description" text,
	"ordre" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avis" ADD CONSTRAINT "avis_livre_id_livres_id_fk" FOREIGN KEY ("livre_id") REFERENCES "public"."livres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avis" ADD CONSTRAINT "avis_plante_id_plantes_id_fk" FOREIGN KEY ("plante_id") REFERENCES "public"."plantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livres" ADD CONSTRAINT "livres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_items" ADD CONSTRAINT "selection_items_selection_id_selections_id_fk" FOREIGN KEY ("selection_id") REFERENCES "public"."selections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_items" ADD CONSTRAINT "selection_items_livre_id_livres_id_fk" FOREIGN KEY ("livre_id") REFERENCES "public"."livres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selection_items" ADD CONSTRAINT "selection_items_plante_id_plantes_id_fk" FOREIGN KEY ("plante_id") REFERENCES "public"."plantes"("id") ON DELETE cascade ON UPDATE no action;