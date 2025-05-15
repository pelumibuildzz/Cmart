-- Add bank details columns to Business table
ALTER TABLE "Business" 
ADD COLUMN IF NOT EXISTS "bankName" TEXT,
ADD COLUMN IF NOT EXISTS "accountNumber" TEXT; 