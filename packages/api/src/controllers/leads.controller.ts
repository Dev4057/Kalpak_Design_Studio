import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import type { CreateLeadInput, UpdateLeadStatusInput, ConvertLeadInput } from '@kalpak/shared'

export async function createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as CreateLeadInput
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert(input)
      .select()
      .single()

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(201).json({ data, message: 'Thank you! We will be in touch soon.' })
  } catch (err) {
    next(err)
  }
}

export async function listLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.query
    let query = supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false })
    const validStatuses = ['new', 'seen', 'converted'] as const
    type LeadDbStatus = (typeof validStatuses)[number]
    if (status && typeof status === 'string' && (validStatuses as readonly string[]).includes(status)) {
      query = query.eq('status', status as LeadDbStatus)
    }
    const { data, error } = await query
    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function updateLeadStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const input = req.body as UpdateLeadStatusInput
    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({ status: input.status })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new AppError(404, 'NOT_FOUND', 'Lead not found')
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function convertLead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const overrides = req.body as ConvertLeadInput

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (leadError || !lead) throw new AppError(404, 'NOT_FOUND', 'Lead not found')
    if (lead.status === 'converted') throw new AppError(409, 'CONFLICT', 'Lead already converted')

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        full_name: overrides.full_name ?? lead.full_name,
        email: overrides.email ?? lead.email,
        phone: overrides.phone ?? lead.phone,
        city: overrides.city ?? lead.city,
        source: 'website_form',
        budget_range: lead.budget_range,
        project_type: lead.project_type as 'residential' | 'commercial' | 'office' | 'hospitality' | 'other' | null,
        lead_status: 'new',
      })
      .select()
      .single()

    if (clientError || !client) throw new AppError(500, 'DB_ERROR', clientError?.message ?? 'Failed to create client')

    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from('leads')
      .update({ status: 'converted', converted_to_client_id: client.id })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new AppError(500, 'DB_ERROR', updateError.message)

    res.status(201).json({ data: { lead: updatedLead, client } })
  } catch (err) {
    next(err)
  }
}
