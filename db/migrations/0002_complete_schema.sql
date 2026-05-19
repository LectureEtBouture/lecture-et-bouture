-- Rayons
CREATE TABLE "rayons" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(150) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"description" text,
	CONSTRAINT "rayons_slug_unique" UNIQUE("slug")
);--> statement-breakpoint

-- Événements
CREATE TABLE "evenements" (
	"id" serial PRIMARY KEY NOT NULL,
	"titre" varchar(300) NOT NULL,
	"description" text,
	"lieu" varchar(300),
	"date_debut" timestamp NOT NULL,
	"date_fin" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint

-- Livres : images[] → image + nouvelles colonnes
ALTER TABLE "livres" DROP COLUMN "images";--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "rayon_id" integer;--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "editeur" varchar(200);--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "collection" varchar(200);--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "format" varchar(100);--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "edition" varchar(100);--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "annee_publication" integer;--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "serie" varchar(200);--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "numero_serie" integer;--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "choix_librairie" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "livres" ADD COLUMN "note_de_la_librairie" text;--> statement-breakpoint
ALTER TABLE "livres" ADD CONSTRAINT "livres_rayon_id_rayons_id_fk" FOREIGN KEY ("rayon_id") REFERENCES "public"."rayons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Plantes : images[] → image + nouvelles colonnes
ALTER TABLE "plantes" DROP COLUMN "images";--> statement-breakpoint
ALTER TABLE "plantes" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "plantes" ADD COLUMN "choix_librairie" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plantes" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plantes" ADD COLUMN "note_de_la_librairie" text;--> statement-breakpoint

-- Avis : champs manquants
ALTER TABLE "avis" ADD COLUMN "produit_nom" varchar(300);--> statement-breakpoint
ALTER TABLE "avis" ADD COLUMN "masque" boolean DEFAULT false NOT NULL;--> statement-breakpoint

-- Sélections : private par défaut
ALTER TABLE "selections" ALTER COLUMN "active" SET DEFAULT false;
