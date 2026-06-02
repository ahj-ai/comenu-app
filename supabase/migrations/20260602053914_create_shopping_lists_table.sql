CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  weekly_plan_id UUID REFERENCES weekly_plans(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see shopping lists in their own household
CREATE POLICY "Users can view shopping lists for their household"
  ON shopping_lists
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert shopping lists for their own household
CREATE POLICY "Users can insert shopping lists for their household"
  ON shopping_lists
  FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can update shopping lists for their own household
CREATE POLICY "Users can update shopping lists for their household"
  ON shopping_lists
  FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can delete shopping lists for their own household
CREATE POLICY "Users can delete shopping lists for their household"
  ON shopping_lists
  FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );
