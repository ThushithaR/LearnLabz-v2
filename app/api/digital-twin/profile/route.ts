import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client with service role key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[Profile API] Initialized with URL:', supabaseUrl);

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

export async function POST(request: NextRequest) {
  console.log('[Profile API] POST request received');
  
  try {
    const { userId, courseId, unitId, metrics } = await request.json();

    console.log('[Profile API] Upserting profile for:', { userId, courseId, unitId });

    if (!serviceRoleKey) {
      console.error('[Profile API] Service role key not configured');
      return NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      );
    }

    if (!userId || !courseId || !unitId || !metrics) {
      console.error('[Profile API] Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('[Profile API] Attempting upsert...');
    
    // Try to upsert to user_learning_profile
    const { data, error } = await supabaseAdmin
      .from('user_learning_profile')
      .upsert({
        user_id: userId,
        course_id: courseId,
        unit_id: unitId,
        metrics: metrics,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,course_id,unit_id'
      })
      .select();

    console.log('[Profile API] Upsert response:', { data, error });

    if (error) {
      console.error('[Profile API] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      // If table doesn't exist, return dummy response (PGRST205 = table not found)
      if (error.code === '42P01' || error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        console.log('[Profile API] user_learning_profile table not found - returning dummy profile for display');
        return NextResponse.json({
          ulp_id: `temp_${userId}_${courseId}_${unitId}`,
          user_id: userId,
          course_id: courseId,
          unit_id: unitId,
          metrics: metrics,
          updated_at: new Date().toISOString(),
        });
      }
      
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      );
    }

    console.log('[Profile API] Profile upserted successfully');
    return NextResponse.json({
      ulp_id: data?.[0]?.ulp_id || `temp_${userId}_${courseId}_${unitId}`,
      user_id: userId,
      course_id: courseId,
      unit_id: unitId,
      metrics: metrics,
      updated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Profile API] Caught error:', err?.message || err, err?.stack);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
