/*
  Warnings:

  - A unique constraint covering the columns `[dui]` on the table `administrativos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dui]` on the table `orientadores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "administrativos_dui_key" ON "public"."administrativos"("dui");

-- CreateIndex
CREATE UNIQUE INDEX "orientadores_dui_key" ON "public"."orientadores"("dui");
