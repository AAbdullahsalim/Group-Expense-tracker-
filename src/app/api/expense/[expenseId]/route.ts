import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

/**
 * PUT /api/expense/[expenseId]
 * Update an expense's information (description, amount)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  try {
    const { expenseId } = await params
    const { description, amount } = await request.json()

    if (!description || !amount) {
      return NextResponse.json(
        { error: 'Description and amount are required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get the user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update the expense (RLS policies ensure user can only update their own expenses)
    const { data, error } = await supabase
      .from('expenses')
      .update({ 
        description, 
        amount: parseFloat(amount) 
      })
      .eq('id', expenseId)
      .eq('created_by', user.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Expense not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/expense/[expenseId]
 * Delete an individual expense
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  try {
    const { expenseId } = await params

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get the user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete the expense
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('created_by', user.id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 