CREATE TABLE IF NOT EXISTS meal_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, household_id)
);

ALTER TABLE meal_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings for their household" ON meal_ratings
  FOR SELECT USING (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert ratings for their household" ON meal_ratings
  FOR INSERT WITH CHECK (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update ratings for their household" ON meal_ratings
  FOR UPDATE USING (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete ratings for their household" ON meal_ratings
  FOR DELETE USING (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));
