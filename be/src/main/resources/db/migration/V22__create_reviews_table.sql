-- Create review_role enum
CREATE TYPE review_role AS ENUM ('DRIVER', 'CUSTOMER');

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid not null default gen_random_uuid (),
  trip_id uuid not null,
  reviewer_id uuid not null,
  reviewee_id uuid not null,
  role public.review_role not null,
  rating smallint not null,
  comment text null,
  created_at timestamp with time zone not null default CURRENT_TIMESTAMP,
  constraint reviews_pkey primary key (id),
  constraint reviews_reviewee_id_fkey foreign KEY (reviewee_id) references profiles (id) on delete CASCADE,
  constraint reviews_reviewer_id_fkey foreign KEY (reviewer_id) references profiles (id) on delete CASCADE,
  constraint reviews_trip_id_fkey foreign KEY (trip_id) references return_routes (id) on delete CASCADE,
  constraint reviews_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_trip_id ON reviews(trip_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
