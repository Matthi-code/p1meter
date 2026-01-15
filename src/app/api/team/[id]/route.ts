import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side Supabase client with service role key (admin privileges)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const deleteAuthUser = searchParams.get('deleteAuthUser') === 'true'

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is verplicht' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // 1. Get the team member to find the user_id
    const { data: teamMember, error: fetchError } = await supabase
      .from('team_members')
      .select('id, user_id, name, email')
      .eq('id', id)
      .single()

    if (fetchError || !teamMember) {
      return NextResponse.json(
        { error: 'Teamlid niet gevonden' },
        { status: 404 }
      )
    }

    // 2. Unassign any installations from this team member
    const { error: unassignError } = await supabase
      .from('installations')
      .update({ assigned_to: null })
      .eq('assigned_to', id)

    if (unassignError) {
      console.error('Unassign installations error:', unassignError)
      // Continue anyway, will try to delete
    }

    // 3. Delete the team_member record
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete team member error:', deleteError)
      return NextResponse.json(
        { error: `Kon teamlid niet verwijderen: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // 4. Optionally delete the auth user
    if (deleteAuthUser && teamMember.user_id) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
        teamMember.user_id
      )

      if (authDeleteError) {
        console.error('Delete auth user error:', authDeleteError)
        // Don't fail the request, team member is already deleted
        return NextResponse.json({
          success: true,
          message: `Teamlid ${teamMember.name} verwijderd, maar auth account kon niet worden verwijderd`,
          warning: authDeleteError.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: deleteAuthUser
        ? `Teamlid ${teamMember.name} en auth account volledig verwijderd`
        : `Teamlid ${teamMember.name} verwijderd`,
    })
  } catch (error) {
    console.error('Delete team member error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
