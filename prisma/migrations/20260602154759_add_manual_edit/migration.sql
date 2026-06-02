-- CreateTable
CREATE TABLE "ManualEdit" (
    "sku" TEXT NOT NULL PRIMARY KEY,
    "productGid" TEXT,
    "editedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
