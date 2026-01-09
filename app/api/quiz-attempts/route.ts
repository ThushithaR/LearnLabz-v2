import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[API] Supabase URL:', supabaseUrl);
console.log('[API] Service Role Key exists:', !!serviceRoleKey);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[API] Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  console.error('[API] Available env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('NEXT')));
}

const supabaseAdmin = createClient(
  supabaseUrl || '',
  serviceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id');
  const courseId = searchParams.get('course_id');
  const unitId = searchParams.get('unit_id');

  const userIdNum = parseInt(userId || '0');
  const courseIdNum = parseInt(courseId || '0');
  const unitIdNum = parseInt(unitId || '0');

  console.log('[API] Fetching quiz attempts:', { userId, courseId, unitId });
  console.log('[API] Parsed as numbers:', { userIdNum, courseIdNum, unitIdNum });

  if (!userId || !courseId || !unitId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    if (!serviceRoleKey) {
      console.error('[API] SUPABASE_SERVICE_ROLE_KEY is not set!');
      return NextResponse.json(
        {
          error: 'Service role key not configured',
          hint: 'Set SUPABASE_SERVICE_ROLE_KEY in .env.local',
          details: 'The server cannot access quiz data without the service role key'
        },
        { status: 500 }
      );
    }

    // First, get ALL quiz attempts to see what's in the table
    console.log('[API] Fetching ALL quiz attempts (no filters) to inspect data...');
    const { data: allAttempts, error: allError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('user_id, course_id, unit_id, quiz_id');

    console.log('[API] All attempts in table:', allAttempts?.length || 0, 'rows');
    if (allAttempts && allAttempts.length > 0) {
      console.log('[API] Sample attempts:', allAttempts.slice(0, 3));
    }

    // Now try the filtered query
    console.log('[API] Making filtered query to quiz_attempts table...');
    console.log('[API] Filter: user_id =', userIdNum, ', course_id =', courseIdNum, ', unit_id =', unitIdNum);
    
    const { data, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userIdNum)
      .eq('course_id', courseIdNum)
      .eq('unit_id', unitIdNum);

    console.log('[API] Filtered query result:', { found: data?.length || 0, error: error?.message });
    
    if (data && data.length > 0) {
      console.log('[API] Sample row:', data[0]);
    }

    if (error) {
      console.error('[API] Supabase error:', error);
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint },
        { status: 500 }
      );
    }

    console.log('[API] Success - returning', data?.length || 0, 'rows');
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('[API] Error:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
