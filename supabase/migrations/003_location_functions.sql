-- Location-based functions for dog discovery
-- Support "dogs within X km" functionality using precise coordinates

-- =========================================
-- FUNCTION: Find dogs within radius
-- Returns dogs within specified radius of given coordinates
-- =========================================
CREATE OR REPLACE FUNCTION find_dogs_within_radius(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    owner_id UUID,
    name TEXT,
    primary_breed TEXT,
    secondary_breed TEXT,
    age INTEGER,
    size TEXT,
    energy_level TEXT,
    training_level TEXT,
    socialization TEXT,
    good_with_kids BOOLEAN,
    good_with_dogs BOOLEAN,
    good_with_cats BOOLEAN,
    photos TEXT[],
    bio TEXT,
    location_lat DECIMAL,
    location_lng DECIMAL,
    location_display TEXT,
    distance_km DECIMAL,
    owner_first_name TEXT,
    owner_last_name TEXT,
    owner_city TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.owner_id,
        d.name,
        d.primary_breed,
        d.secondary_breed,
        d.age,
        d.size,
        d.energy_level,
        d.training_level,
        d.socialization,
        d.good_with_kids,
        d.good_with_dogs,
        d.good_with_cats,
        d.photos,
        d.bio,
        d.location_lat,
        d.location_lng,
        d.location_display,
        calculate_distance(user_lat, user_lng, d.location_lat, d.location_lng) AS distance_km,
        p.first_name,
        p.last_name,
        p.city
    FROM dogs d
    JOIN profiles p ON d.owner_id = p.id
    WHERE calculate_distance(user_lat, user_lng, d.location_lat, d.location_lng) <= radius_km
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- FUNCTION: Advanced dog matching
-- Match dogs based on compatibility criteria
-- =========================================
CREATE OR REPLACE FUNCTION find_compatible_dogs(
    user_dog_id UUID,
    radius_km DECIMAL DEFAULT 10,
    match_energy_level BOOLEAN DEFAULT true,
    match_training_level BOOLEAN DEFAULT false,
    must_be_good_with_dogs BOOLEAN DEFAULT true
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    primary_breed TEXT,
    age INTEGER,
    size TEXT,
    energy_level TEXT,
    training_level TEXT,
    socialization TEXT,
    photos TEXT[],
    bio TEXT,
    distance_km DECIMAL,
    compatibility_score INTEGER,
    owner_first_name TEXT,
    owner_last_name TEXT
) AS $$
DECLARE
    user_dog RECORD;
BEGIN
    -- Get the user's dog details
    SELECT * INTO user_dog
    FROM dogs
    WHERE dogs.id = user_dog_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Dog not found';
    END IF;

    RETURN QUERY
    SELECT
        d.id,
        d.name,
        d.primary_breed,
        d.age,
        d.size,
        d.energy_level,
        d.training_level,
        d.socialization,
        d.photos,
        d.bio,
        calculate_distance(user_dog.location_lat, user_dog.location_lng, d.location_lat, d.location_lng) AS distance_km,
        -- Simple compatibility scoring
        (
            CASE WHEN NOT match_energy_level OR d.energy_level = user_dog.energy_level THEN 2 ELSE 0 END +
            CASE WHEN NOT match_training_level OR d.training_level = user_dog.training_level THEN 1 ELSE 0 END +
            CASE WHEN d.good_with_dogs = true THEN 2 ELSE 0 END +
            CASE WHEN user_dog.good_with_dogs = true THEN 1 ELSE 0 END +
            CASE WHEN d.socialization = 'excellent' THEN 2 WHEN d.socialization = 'good' THEN 1 ELSE 0 END
        ) AS compatibility_score,
        p.first_name,
        p.last_name
    FROM dogs d
    JOIN profiles p ON d.owner_id = p.id
    WHERE
        d.id != user_dog_id -- Don't match with self
        AND d.owner_id != user_dog.owner_id -- Don't match with same owner
        AND calculate_distance(user_dog.location_lat, user_dog.location_lng, d.location_lat, d.location_lng) <= radius_km
        AND (NOT must_be_good_with_dogs OR d.good_with_dogs = true)
    ORDER BY compatibility_score DESC, distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- FUNCTION: Get upcoming health reminders
-- Find treatments due soon for proactive notifications
-- =========================================
CREATE OR REPLACE FUNCTION get_upcoming_health_reminders(
    days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
    dog_id UUID,
    dog_name TEXT,
    owner_id UUID,
    owner_email TEXT,
    treatment_type TEXT,
    treatment_name TEXT,
    due_date DATE,
    days_until_due INTEGER
) AS $$
BEGIN
    RETURN QUERY
    -- Vaccinations
    SELECT
        d.id,
        d.name,
        d.owner_id,
        p.email,
        'vaccination'::TEXT,
        v.name,
        v.next_due_date,
        (v.next_due_date - CURRENT_DATE)::INTEGER
    FROM vaccinations v
    JOIN dogs d ON v.dog_id = d.id
    JOIN profiles p ON d.owner_id = p.id
    WHERE v.next_due_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
      AND v.next_due_date >= CURRENT_DATE

    UNION ALL

    -- Worming treatments
    SELECT
        d.id,
        d.name,
        d.owner_id,
        p.email,
        'worming'::TEXT,
        w.name,
        w.next_due_date,
        (w.next_due_date - CURRENT_DATE)::INTEGER
    FROM worming_treatments w
    JOIN dogs d ON w.dog_id = d.id
    JOIN profiles p ON d.owner_id = p.id
    WHERE w.next_due_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
      AND w.next_due_date >= CURRENT_DATE

    UNION ALL

    -- Flea treatments
    SELECT
        d.id,
        d.name,
        d.owner_id,
        p.email,
        'flea'::TEXT,
        f.name,
        f.next_due_date,
        (f.next_due_date - CURRENT_DATE)::INTEGER
    FROM flea_treatments f
    JOIN dogs d ON f.dog_id = d.id
    JOIN profiles p ON d.owner_id = p.id
    WHERE f.next_due_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
      AND f.next_due_date >= CURRENT_DATE

    ORDER BY due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- FUNCTION: Search dogs by criteria
-- Advanced search with multiple filters
-- =========================================
CREATE OR REPLACE FUNCTION search_dogs(
    search_term TEXT DEFAULT '',
    user_lat DECIMAL DEFAULT NULL,
    user_lng DECIMAL DEFAULT NULL,
    max_distance_km DECIMAL DEFAULT 50,
    min_age INTEGER DEFAULT 0,
    max_age INTEGER DEFAULT 30,
    sizes TEXT[] DEFAULT NULL,
    energy_levels TEXT[] DEFAULT NULL,
    training_levels TEXT[] DEFAULT NULL,
    good_with_kids_only BOOLEAN DEFAULT false,
    good_with_dogs_only BOOLEAN DEFAULT false,
    good_with_cats_only BOOLEAN DEFAULT false,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    primary_breed TEXT,
    age INTEGER,
    size TEXT,
    energy_level TEXT,
    training_level TEXT,
    photos TEXT[],
    bio TEXT,
    distance_km DECIMAL,
    owner_first_name TEXT,
    owner_last_name TEXT,
    owner_city TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.name,
        d.primary_breed,
        d.age,
        d.size,
        d.energy_level,
        d.training_level,
        d.photos,
        d.bio,
        CASE
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
                calculate_distance(user_lat, user_lng, d.location_lat, d.location_lng)
            ELSE NULL
        END AS distance_km,
        p.first_name,
        p.last_name,
        p.city
    FROM dogs d
    JOIN profiles p ON d.owner_id = p.id
    WHERE
        (search_term = '' OR
         d.name ILIKE '%' || search_term || '%' OR
         d.primary_breed ILIKE '%' || search_term || '%' OR
         d.secondary_breed ILIKE '%' || search_term || '%')
        AND d.age BETWEEN min_age AND max_age
        AND (sizes IS NULL OR d.size = ANY(sizes))
        AND (energy_levels IS NULL OR d.energy_level = ANY(energy_levels))
        AND (training_levels IS NULL OR d.training_level = ANY(training_levels))
        AND (NOT good_with_kids_only OR d.good_with_kids = true)
        AND (NOT good_with_dogs_only OR d.good_with_dogs = true)
        AND (NOT good_with_cats_only OR d.good_with_cats = true)
        AND (user_lat IS NULL OR user_lng IS NULL OR
             calculate_distance(user_lat, user_lng, d.location_lat, d.location_lng) <= max_distance_km)
    ORDER BY
        CASE
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
                calculate_distance(user_lat, user_lng, d.location_lat, d.location_lng)
            ELSE d.created_at
        END ASC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- GRANT PERMISSIONS
-- Allow authenticated users to call these functions
-- =========================================
GRANT EXECUTE ON FUNCTION find_dogs_within_radius TO authenticated;
GRANT EXECUTE ON FUNCTION find_compatible_dogs TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_health_reminders TO authenticated;
GRANT EXECUTE ON FUNCTION search_dogs TO authenticated;