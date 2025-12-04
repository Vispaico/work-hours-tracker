// @ts-expect-error - Deno runtime with ESM imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
// @ts-expect-error - Deno runtime with ESM imports
import { Resend } from 'https://esm.sh/resend@2.0.0';

declare const Deno: any;

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return new Response(JSON.stringify({ error: 'Supabase credentials not set' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    try {
        // 1. List all users (pagination might be needed for large user bases)
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
            throw usersError;
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        // Simple check: match hour and minute within a small window or just hour/minute exact match if run frequently.
        // Assuming cron runs every hour or specific times.
        // If cron runs every 10 mins, we check if reminder time is within the last 10 mins?
        // For simplicity, let's assume we want to match exact time or close to it.
        // Let's format current time as HH:mm
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        const emailsToSend = [];

        for (const user of users) {
            const metadata = user.user_metadata?.workHoursTracker;
            if (!metadata || !metadata.reminderSettings) continue;

            const { reminderSettings } = metadata;

            if (reminderSettings.enabled && reminderSettings.emailEnabled && reminderSettings.time === currentTimeString) {
                // Send email
                if (user.email) {
                    emailsToSend.push({
                        from: 'Work Hours Tracker <onboarding@resend.dev>', // Update this with verified domain
                        to: [user.email],
                        subject: 'Time to log your work hours!',
                        html: `<p>Hi there,</p><p>This is your friendly reminder to log your work hours for today.</p><p><a href="https://work-hours-tracker.vercel.app">Open App</a></p>`,
                    });
                }
            }
        }

        const results = await Promise.allSettled(emailsToSend.map(email => resend.emails.send(email)));

        return new Response(JSON.stringify({ sent: results.length, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
