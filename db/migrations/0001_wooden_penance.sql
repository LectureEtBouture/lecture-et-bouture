ALTER TABLE "avis" RENAME COLUMN "plante_id" TO "bouture_id";--> statement-breakpoint
ALTER TABLE "avis" DROP CONSTRAINT "avis_livre_id_livres_id_fk";
--> statement-breakpoint
ALTER TABLE "avis" DROP CONSTRAINT "avis_plante_id_plantes_id_fk";
--> statement-breakpoint
ALTER TABLE "avis" ALTER COLUMN "type" SET DATA TYPE text;