-- AlterTable
ALTER TABLE "AnswerOption" ADD COLUMN     "textEn" TEXT,
ADD COLUMN     "textKk" TEXT,
ADD COLUMN     "textRu" TEXT;

-- AlterTable
ALTER TABLE "AssessmentModule" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionKk" TEXT,
ADD COLUMN     "descriptionRu" TEXT,
ADD COLUMN     "titleEn" TEXT,
ADD COLUMN     "titleKk" TEXT,
ADD COLUMN     "titleRu" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionKk" TEXT,
ADD COLUMN     "descriptionRu" TEXT,
ADD COLUMN     "textEn" TEXT,
ADD COLUMN     "textKk" TEXT,
ADD COLUMN     "textRu" TEXT;
