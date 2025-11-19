-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mode" TEXT NOT NULL DEFAULT 'mismo_dia',
    "daysAhead" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" DATETIME NOT NULL
);
