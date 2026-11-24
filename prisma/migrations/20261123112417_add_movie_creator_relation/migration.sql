-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "created_by" TEXT;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
