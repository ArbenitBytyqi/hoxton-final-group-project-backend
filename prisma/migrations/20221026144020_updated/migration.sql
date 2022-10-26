/*
  Warnings:

  - You are about to drop the column `name` on the `Author` table. All the data in the column will be lost.
  - Added the required column `fullname` to the `Author` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullname" TEXT NOT NULL,
    "image" TEXT NOT NULL
);
INSERT INTO "new_Author" ("id", "image") SELECT "id", "image" FROM "Author";
DROP TABLE "Author";
ALTER TABLE "new_Author" RENAME TO "Author";
CREATE UNIQUE INDEX "Author_fullname_key" ON "Author"("fullname");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
