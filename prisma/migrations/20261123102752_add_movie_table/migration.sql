-- CreateIndex
CREATE INDEX "Movie_title_idx" ON "Movie"("title");

-- CreateIndex
CREATE INDEX "Movie_release_date_idx" ON "Movie"("release_date");

-- CreateIndex
CREATE INDEX "Movie_rating_count_idx" ON "Movie"("rating_count");

-- CreateIndex
CREATE INDEX "Movie_title_release_date_idx" ON "Movie"("title", "release_date");
