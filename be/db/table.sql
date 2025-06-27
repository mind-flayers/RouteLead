-- 1. ENUM type definitions (create if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role       AS ENUM ('DRIVER','CUSTOMER','ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_status') THEN
    CREATE TYPE route_status    AS ENUM ('OPEN','BOOKED','COMPLETED','CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'parcel_status') THEN
    CREATE TYPE parcel_status   AS ENUM ('OPEN','MATCHED','EXPIRED','CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bid_status') THEN
    CREATE TYPE bid_status      AS ENUM ('PENDING','ACCEPTED','REJECTED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'BID_UPDATE','BOOKING_CONFIRMED','DELIVERY_STATUS','ROUTE_CHANGED','DISPUTE_ALERT'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_role') THEN
    CREATE TYPE review_role     AS ENUM ('DRIVER','CUSTOMER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_entity_type') THEN
    CREATE TYPE admin_entity_type AS ENUM ('USER','ROUTE','BID','DISPUTE');
  END IF;
END
$$;

-- 2. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255)    NOT NULL UNIQUE,
  role                user_role       NOT NULL DEFAULT 'CUSTOMER',
  first_name          VARCHAR(100),
  last_name           VARCHAR(100),
  phone_number        VARCHAR(20),
  nic_number          VARCHAR(20),
  profile_photo_url   TEXT,
  is_verified         BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profiles_id_fkey FOREIGN KEY(id) REFERENCES auth.users(id)
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. vehicle_details
CREATE TABLE IF NOT EXISTS public.vehicle_details (
  id                  BIGSERIAL       PRIMARY KEY,
  driver_id           UUID            NOT NULL
                                REFERENCES public.profiles(id) ON DELETE CASCADE,
  color               VARCHAR(255),
  make                VARCHAR(255)    NOT NULL,
  model               VARCHAR(255)    NOT NULL,
  year_of_manufacture INTEGER,
  plate_number        VARCHAR(20)     NOT NULL,
  max_weight_kg       NUMERIC         NOT NULL DEFAULT 0,
  max_volume_m3       NUMERIC         NOT NULL DEFAULT 0,
  vehicle_photos      JSONB           NOT NULL DEFAULT '[]'::JSONB,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_vehicle_details_updated_at
  BEFORE UPDATE ON public.vehicle_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. return_routes
CREATE TABLE IF NOT EXISTS public.return_routes (
  id                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id            UUID            NOT NULL
                                REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin_lat           NUMERIC         NOT NULL,
  origin_lng           NUMERIC         NOT NULL,
  destination_lat      NUMERIC         NOT NULL,
  destination_lng      NUMERIC         NOT NULL,
  departure_time       TIMESTAMPTZ     NOT NULL,
  detour_tolerance_km  NUMERIC         NOT NULL DEFAULT 0,
  suggested_price_min  NUMERIC         NOT NULL,
  suggested_price_max  NUMERIC         NOT NULL,
  status               route_status    NOT NULL DEFAULT 'OPEN',
  created_at           TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_return_routes_updated_at
  BEFORE UPDATE ON public.return_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. route_segments
CREATE TABLE IF NOT EXISTS public.route_segments (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id       UUID        NOT NULL
                            REFERENCES public.return_routes(id) ON DELETE CASCADE,
  segment_index  INTEGER     NOT NULL,
  start_lat      NUMERIC     NOT NULL,
  start_lng      NUMERIC     NOT NULL,
  end_lat        NUMERIC     NOT NULL,
  end_lng        NUMERIC     NOT NULL,
  distance_km    NUMERIC     NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(route_id, segment_index)
);

-- 6. parcel_requests
CREATE TABLE IF NOT EXISTS public.parcel_requests (
  id             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID            NOT NULL
                                REFERENCES public.profiles(id) ON DELETE CASCADE,
  pickup_lat     NUMERIC         NOT NULL,
  pickup_lng     NUMERIC         NOT NULL,
  dropoff_lat    NUMERIC         NOT NULL,
  dropoff_lng    NUMERIC         NOT NULL,
  weight_kg      NUMERIC         NOT NULL,
  volume_m3      NUMERIC         NOT NULL,
  description    TEXT,
  max_budget     NUMERIC         NOT NULL,
  deadline       TIMESTAMPTZ     NOT NULL,
  status         parcel_status   NOT NULL DEFAULT 'OPEN',
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_parcel_requests_updated_at
  BEFORE UPDATE ON public.parcel_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. bids
CREATE TABLE IF NOT EXISTS public.bids (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     UUID        NOT NULL
                            REFERENCES public.parcel_requests(id) ON DELETE CASCADE,
  route_id       UUID        NOT NULL
                            REFERENCES public.return_routes(id) ON DELETE CASCADE,
  start_index    INTEGER     NOT NULL,
  end_index      INTEGER     NOT NULL,
  offered_price  NUMERIC     NOT NULL,
  status         bid_status  NOT NULL DEFAULT 'PENDING',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. price_predictions
CREATE TABLE IF NOT EXISTS public.price_predictions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id      UUID        NOT NULL
                            REFERENCES public.return_routes(id) ON DELETE CASCADE,
  min_price     NUMERIC     NOT NULL,
  max_price     NUMERIC     NOT NULL,
  model_version TEXT        NOT NULL,
  features      JSONB       NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID         NOT NULL
                            REFERENCES public.return_routes(id) ON DELETE CASCADE,
  reviewer_id   UUID         NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id   UUID         NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
  role          review_role  NOT NULL,
  rating        SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID               NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          notification_type  NOT NULL,
  payload       JSONB              NOT NULL,
  is_read       BOOLEAN            NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. admin_actions
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id             UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id       UUID               NOT NULL
                            REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type    admin_entity_type  NOT NULL,
  entity_id      UUID               NOT NULL,
  action         TEXT               NOT NULL,
  notes          TEXT,
  performed_at   TIMESTAMPTZ        NOT NULL DEFAULT CURRENT_TIMESTAMP
);
