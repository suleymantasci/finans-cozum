-- CreateTable
CREATE TABLE IF NOT EXISTS "favorite_markets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_markets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "favorite_markets_userId_idx" ON "favorite_markets"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "favorite_markets_symbol_category_idx" ON "favorite_markets"("symbol", "category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "favorite_markets_userId_symbol_category_key" ON "favorite_markets"("userId", "symbol", "category");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'favorite_markets_userId_fkey'
    ) THEN
        ALTER TABLE "favorite_markets" ADD CONSTRAINT "favorite_markets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


