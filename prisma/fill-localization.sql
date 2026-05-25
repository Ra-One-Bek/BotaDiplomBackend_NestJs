UPDATE "AssessmentModule"
SET
  "titleRu" = "title",
  "descriptionRu" = "description"
WHERE "titleRu" IS NULL;

UPDATE "Question"
SET
  "textRu" = "text",
  "descriptionRu" = "description"
WHERE "textRu" IS NULL;

UPDATE "AnswerOption"
SET
  "textRu" = "text"
WHERE "textRu" IS NULL;