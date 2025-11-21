import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderSettings {
    enabled: boolean;
    emailEnabled: boolean;
    time: string;
    lastScheduledAt?: string | null;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get all users
        // Note: In a real app with many users, you'd paginate this or use a specific table for settings.
        // For now, we'll iterate through users who have metadata.
        const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers()

        if (usersError) throw usersError

        const emailsSent: string[] = []

        for (const user of users) {
            const metadata = user.user_metadata?.workHoursTracker
            const settings = metadata?.reminderSettings as ReminderSettings | undefined

            // Check if email reminders are enabled
            if (settings?.emailEnabled && user.email) {
                // 2. Check if they worked today
                // Ideally, we'd check their timezone. For simplicity, we'll use UTC or a default offset.
                // A robust solution would store the user's timezone in settings.
                const today = new Date().toISOString().split('T')[0]

                // Check entries in metadata (since we sync to metadata)
                // Note: This relies on the metadata being up to date.
                const entries = metadata?.entries || []
                const hasEntryToday = entries.some((e: any) => e.date.startsWith(today))

                if (!hasEntryToday) {
                    // 3. Send Email
                    // Replace this with your actual email service (Resend, SendGrid, AWS SES, etc.)
                    console.log(`[Mock Email] Sending reminder to ${user.email}`)

                    // Example using a hypothetical fetch to an email API:
                    /*
                    await fetch('https://api.resend.com/emails', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        from: 'Work Tracker <onboarding@resend.dev>',
                        to: user.email,
                        subject: 'Did you work today?',
                        html: '<p>Don't forget to log your work hours!</p>'
                      })
                    })
                    */

                    emailsSent.push(user.email)
                }
            }
        }

        return new Response(
            JSON.stringify({ success: true, emailsSent }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
