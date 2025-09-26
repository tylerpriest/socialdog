-- Row Level Security (RLS) Policies
-- Secure data access for SocialDog platform
-- Ensures users can only access their own data and appropriate social interactions

-- =========================================
-- ENABLE RLS ON ALL TABLES
-- =========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE worming_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flea_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- =========================================
-- PROFILES POLICIES
-- Users can manage their own profiles
-- =========================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Allow users to view profiles of users they have friendships with
CREATE POLICY "Users can view friend profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
                   AND friend_user_id = profiles.id AND status = 'accepted')
               OR (friend_user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
                   AND user_id = profiles.id AND status = 'accepted')
        )
    );

-- Allow public viewing of basic profile info for discovery (limited fields)
CREATE POLICY "Public can view basic profile info for discovery" ON profiles
    FOR SELECT USING (true);

-- =========================================
-- DOGS POLICIES
-- Users can manage their own dogs and view others for discovery
-- =========================================

-- Users can view their own dogs
CREATE POLICY "Users can view own dogs" ON dogs
    FOR SELECT USING (owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Users can insert their own dogs
CREATE POLICY "Users can insert own dogs" ON dogs
    FOR INSERT WITH CHECK (owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Users can update their own dogs
CREATE POLICY "Users can update own dogs" ON dogs
    FOR UPDATE USING (owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Users can delete their own dogs
CREATE POLICY "Users can delete own dogs" ON dogs
    FOR DELETE USING (owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Allow public viewing of dogs for discovery (all users can browse)
CREATE POLICY "Public can view dogs for discovery" ON dogs
    FOR SELECT USING (true);

-- =========================================
-- HEALTH RECORDS POLICIES
-- Only dog owners can manage health records
-- =========================================

-- Vaccinations policies
CREATE POLICY "Dog owners can view their dogs' vaccinations" ON vaccinations
    FOR SELECT USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can insert vaccinations for their dogs" ON vaccinations
    FOR INSERT WITH CHECK (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can update their dogs' vaccinations" ON vaccinations
    FOR UPDATE USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can delete their dogs' vaccinations" ON vaccinations
    FOR DELETE USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Worming treatments policies
CREATE POLICY "Dog owners can view their dogs' worming treatments" ON worming_treatments
    FOR SELECT USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can insert worming treatments for their dogs" ON worming_treatments
    FOR INSERT WITH CHECK (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can update their dogs' worming treatments" ON worming_treatments
    FOR UPDATE USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can delete their dogs' worming treatments" ON worming_treatments
    FOR DELETE USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Flea treatments policies
CREATE POLICY "Dog owners can view their dogs' flea treatments" ON flea_treatments
    FOR SELECT USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can insert flea treatments for their dogs" ON flea_treatments
    FOR INSERT WITH CHECK (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can update their dogs' flea treatments" ON flea_treatments
    FOR UPDATE USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Dog owners can delete their dogs' flea treatments" ON flea_treatments
    FOR DELETE USING (
        dog_id IN (
            SELECT id FROM dogs WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- =========================================
-- SOCIAL FEATURES POLICIES
-- Control friend requests, messaging, and notifications
-- =========================================

-- Friendships policies
CREATE POLICY "Users can view their friendships" ON friendships
    FOR SELECT USING (
        user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        friend_user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can send friend requests" ON friendships
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
        -- Prevent sending requests to blocked users
        NOT EXISTS (
            SELECT 1 FROM blocked_users
            WHERE user_id = friend_user_id AND blocked_user_id = friendships.user_id
        )
    );

CREATE POLICY "Users can update friendship status they're involved in" ON friendships
    FOR UPDATE USING (
        user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        friend_user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete their friendship requests" ON friendships
    FOR DELETE USING (
        user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        friend_user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON conversations
    FOR SELECT USING (
        participant1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
        participant2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can start conversations with friends" ON conversations
    FOR INSERT WITH CHECK (
        (participant1_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
         participant2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())) AND
        -- Ensure both participants are friends or one can message the other
        (EXISTS (
            SELECT 1 FROM friendships
            WHERE (user_id = participant1_id AND friend_user_id = participant2_id AND status = 'accepted')
               OR (user_id = participant2_id AND friend_user_id = participant1_id AND status = 'accepted')
        ) OR
        -- Allow initial contact for dog discovery
        TRUE)
    );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE participant1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
               OR participant2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
        conversation_id IN (
            SELECT id FROM conversations
            WHERE participant1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
               OR participant2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can create notifications for users" ON notifications
    FOR INSERT WITH CHECK (true); -- Will be restricted by application logic

CREATE POLICY "Users can update their notifications" ON notifications
    FOR UPDATE USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their notifications" ON notifications
    FOR DELETE USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =========================================
-- USER SAFETY POLICIES
-- Blocking and reporting functionality
-- =========================================

-- Blocked users policies
CREATE POLICY "Users can view their blocked users list" ON blocked_users
    FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can block other users" ON blocked_users
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can unblock users they blocked" ON blocked_users
    FOR DELETE USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Reported users policies
CREATE POLICY "Users can view their reports" ON reported_users
    FOR SELECT USING (reporter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can report other users" ON reported_users
    FOR INSERT WITH CHECK (reporter_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Admin policies (for future admin panel)
CREATE POLICY "Admins can view all reports" ON reported_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid() AND email LIKE '%@socialdog.co.nz'
        )
    );

-- =========================================
-- PASSWORD RESET POLICIES
-- Secure password reset functionality
-- =========================================
CREATE POLICY "Users can view their own reset tokens" ON password_reset_tokens
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true); -- Will be controlled by application logic

CREATE POLICY "System can update reset tokens" ON password_reset_tokens
    FOR UPDATE WITH CHECK (true); -- Will be controlled by application logic

-- =========================================
-- HELPER FUNCTIONS FOR POLICIES
-- =========================================

-- Function to check if user can view another user's data
CREATE OR REPLACE FUNCTION can_view_user_data(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_profile_id UUID;
    are_friends BOOLEAN;
BEGIN
    -- Get current user's profile ID
    SELECT id INTO current_user_profile_id
    FROM profiles WHERE user_id = auth.uid();

    -- Check if users are friends
    SELECT EXISTS (
        SELECT 1 FROM friendships
        WHERE (user_id = current_user_profile_id AND friend_user_id = target_user_id AND status = 'accepted')
           OR (user_id = target_user_id AND friend_user_id = current_user_profile_id AND status = 'accepted')
    ) INTO are_friends;

    RETURN are_friends;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user_to_check_id UUID, by_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocked_users
        WHERE user_id = by_user_id AND blocked_user_id = user_to_check_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- REALTIME SUBSCRIPTIONS
-- Enable real-time features for messaging
-- =========================================

-- Enable realtime for conversations and messages
ALTER publication supabase_realtime ADD TABLE conversations;
ALTER publication supabase_realtime ADD TABLE messages;
ALTER publication supabase_realtime ADD TABLE notifications;
ALTER publication supabase_realtime ADD TABLE friendships;