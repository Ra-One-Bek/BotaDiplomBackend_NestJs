-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityReview" (
    "id" SERIAL NOT NULL,
    "universityId" INTEGER NOT NULL,
    "author" TEXT,
    "rating" DOUBLE PRECISION,
    "text" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "externalId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UniversityReview_universityId_idx" ON "UniversityReview"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityReview_universityId_source_text_key" ON "UniversityReview"("universityId", "source", "text");

-- AddForeignKey
ALTER TABLE "UniversityReview" ADD CONSTRAINT "UniversityReview_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
