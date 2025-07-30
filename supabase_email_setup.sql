-- Update password reset email template
-- This will make the password reset emails more reliable

-- The email template should be updated in the Supabase dashboard:
-- 1. Go to Authentication > Emails
-- 2. Select "Reset Password" template
-- 3. Update the subject to: "Reset Your SkillSwap Password"
-- 4. Update the message body to:

/*
Subject: Reset Your SkillSwap Password

Message Body:
<h2>Reset Your Password</h2>
<p>You requested a password reset for your SkillSwap account.</p>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link will expire in 24 hours.</p>
*/

-- Also ensure SMTP settings are configured for better email delivery
-- Go to Authentication > Emails > SMTP Settings
-- Consider setting up a custom SMTP server for production use 