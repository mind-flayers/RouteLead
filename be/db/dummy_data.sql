-- Dummy Data for RouteLead Database
-- Generated on 2025-07-07
-- Uses existing users.

-- Insert new return routes for existing drivers
INSERT INTO public.return_routes (id, driver_id, origin_lat, origin_lng, destination_lat, destination_lng, departure_time, detour_tolerance_km, suggested_price_min, suggested_price_max, status, created_at, updated_at)
VALUES
(gen_random_uuid(), '797c6f16-a06a-46b4-ae9f-9ded8aa4ab27', 6.0535, 80.2210, 6.9271, 79.8612, '2025-07-08 08:00:00+05:30', 10, 1500, 2500, 'OPEN', '2025-07-07 11:00:00+05:30', '2025-07-07 11:00:00+05:30'), -- Galle to Colombo
(gen_random_uuid(), 'cdceaa3e-ab91-45d3-a971-efef43624682', 9.6615, 80.0255, 7.2906, 80.6337, '2025-07-09 09:00:00+05:30', 15, 3000, 5000, 'OPEN', '2025-07-07 11:05:00+05:30', '2025-07-07 11:05:00+05:30'); -- Jaffna to Kandy

-- Insert new parcel requests from existing customers
INSERT INTO public.parcel_requests (id, customer_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, weight_kg, volume_m3, description, max_budget, deadline, status, created_at, updated_at)
VALUES
(gen_random_uuid(), '70ba4867-edcb-4628-b614-7bb60e935862', 6.8676, 79.8813, 6.0535, 80.2210, 10, 0.05, 'Urgent Documents', 1800, '2025-07-08 18:00:00+05:30', 'OPEN', '2025-07-07 11:30:00+05:30', '2025-07-07 11:30:00+05:30'), -- Mount Lavinia to Galle
(gen_random_uuid(), '7139f8e2-2411-4b90-85dc-0d520427708b', 7.2906, 80.6337, 9.6615, 80.0255, 25, 0.2, 'Handicrafts', 4000, '2025-07-10 18:00:00+05:30', 'OPEN', '2025-07-07 11:35:00+05:30', '2025-07-07 11:35:00+05:30'), -- Kandy to Jaffna
(gen_random_uuid(), '05214edd-a8fa-4db5-89b9-57b3a3d99389', 6.7969, 79.9018, 5.9495, 80.5468, 15, 0.1, 'Books', 2500, '2025-07-11 18:00:00+05:30', 'OPEN', '2025-07-07 11:40:00+05:30', '2025-07-07 11:40:00+05:30'); -- Panadura to Matara

-- To insert bids, reviews, etc., we need the IDs of the newly created return_routes and parcel_requests.
-- Since the IDs are generated randomly, we can't know them in advance.
-- In a real application, you would fetch these IDs after inserting them.
-- For this dummy script, we will assume we know the IDs.

-- To make this runnable, you would need to manually get the IDs after running the above inserts
-- and then run the subsequent inserts. For example:
-- DO $$
-- DECLARE
--   route1_id UUID;
--   route2_id UUID;
--   parcel1_id UUID;
--   parcel2_id UUID;
--   parcel3_id UUID;
--   bid1_id UUID;
--   bid2_id UUID;
--   convo1_id UUID;
-- BEGIN
--   -- Get recently created routes and parcels
--   SELECT id INTO route1_id FROM public.return_routes WHERE driver_id = '797c6f16-a06a-46b4-ae9f-9ded8aa4ab27' ORDER BY created_at DESC LIMIT 1;
--   SELECT id INTO route2_id FROM public.return_routes WHERE driver_id = 'cdceaa3e-ab91-45d3-a971-efef43624682' ORDER BY created_at DESC LIMIT 1;
--   SELECT id INTO parcel1_id FROM public.parcel_requests WHERE customer_id = '70ba4867-edcb-4628-b614-7bb60e935862' ORDER BY created_at DESC LIMIT 1;
--   SELECT id INTO parcel2_id FROM public.parcel_requests WHERE customer_id = '7139f8e2-2411-4b90-85dc-0d520427708b' ORDER BY created_at DESC LIMIT 1;
--   SELECT id INTO parcel3_id FROM public.parcel_requests WHERE customer_id = '05214edd-a8fa-4db5-89b9-57b3a3d99389' ORDER BY created_at DESC LIMIT 1;
--
--   -- Insert bids
--   INSERT INTO public.bids (id, request_id, route_id, start_index, end_index, offered_price, status, created_at, updated_at)
--   VALUES
--   (gen_random_uuid(), parcel1_id, route1_id, 0, 1, 1600, 'ACCEPTED', '2025-07-07 12:00:00+05:30', '2025-07-07 12:00:00+05:30'),
--   (gen_random_uuid(), parcel2_id, route2_id, 0, 1, 3500, 'PENDING', '2025-07-07 12:05:00+05:30', '2025-07-07 12:05:00+05:30')
--   RETURNING id INTO bid1_id, id;
--
--   -- Insert reviews for a completed trip (using an existing completed route for context)
--   INSERT INTO public.reviews (trip_id, reviewer_id, reviewee_id, role, rating, comment, created_at)
--   VALUES
--   ('b7dbd56d-3471-49c8-a776-d0d6a9ccc4d1', '7139f8e2-2411-4b90-85dc-0d520427708b', 'cdceaa3e-ab91-45d3-a971-efef43624682', 'CUSTOMER', 5, 'Great driver, very professional!', '2025-07-07 14:00:00+05:30'),
--   ('b7dbd56d-3471-49c8-a776-d0d6a9ccc4d1', 'cdceaa3e-ab91-45d3-a971-efef43624682', '7139f8e2-2411-4b90-85dc-0d520427708b', 'DRIVER', 5, 'Customer was very helpful and responsive.', '2025-07-07 14:05:00+05:30');
--
--   -- Insert notifications
--   INSERT INTO public.notifications (user_id, type, payload, is_read, created_at)
--   VALUES
--   ('70ba4867-edcb-4628-b614-7bb60e935862', 'BID_UPDATE', jsonb_build_object('bid_id', bid1_id, 'status', 'ACCEPTED'), false, '2025-07-07 12:01:00+05:30'),
--   ('797c6f16-a06a-46b4-ae9f-9ded8aa4ab27', 'BOOKING_CONFIRMED', jsonb_build_object('bid_id', bid1_id), false, '2025-07-07 12:01:00+05:30');
--
--   -- Insert a conversation and messages
--   INSERT INTO public.conversations (id, bid_id, customer_id, driver_id, last_message_at, created_at)
--   VALUES
--   (gen_random_uuid(), bid1_id, '70ba4867-edcb-4628-b614-7bb60e935862', '797c6f16-a06a-46b4-ae9f-9ded8aa4ab27', '2025-07-07 12:10:00+05:30', '2025-07-07 12:08:00+05:30')
--   RETURNING id INTO convo1_id;
--
--   INSERT INTO public.messages (conversation_id, sender_id, message_text, message_type, is_read, created_at)
--   VALUES
--   (convo1_id, '70ba4867-edcb-4628-b614-7bb60e935862', 'Hi, can you confirm the pickup time?', 'TEXT', true, '2025-07-07 12:09:00+05:30'),
--   (convo1_id, '797c6f16-a06a-46b4-ae9f-9ded8aa4ab27', 'Yes, I will be there around 8:30 AM tomorrow.', 'TEXT', false, '2025-07-07 12:10:00+05:30');
--
--   -- Insert a payment
--   INSERT INTO public.payments (user_id, bid_id, amount, currency, payment_status, created_at, updated_at)
--   VALUES
--   ('70ba4867-edcb-4628-b614-7bb60e935862', bid1_id, 1600, 'LKR', 'COMPLETED', '2025-07-07 12:15:00+05:30', '2025-07-07 12:15:00+05:30');
--
-- END;
-- $$;
