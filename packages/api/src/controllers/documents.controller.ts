import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '@kalpak/db'
import { AppError } from '../middleware/errorHandler.js'
import { z } from 'zod'

const CreateDocumentSchema = z.object({
  file_name: z.string().min(1),
  file_type: z.enum(['drawing', 'boq', 'contract', 'proposal', 'invoice', 'photo', 'other']).optional(),
  file_size_bytes: z.number().int().positive().optional(),
  content_type: z.string().optional(),
})

export async function listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const { data, error } = await supabaseAdmin
      .from('project_documents')
      .select('*, profiles(full_name)')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false })

    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function createDocumentUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id: project_id } = req.params
    const input = CreateDocumentSchema.parse(req.body)

    const storagePath = `${project_id}/${Date.now()}_${input.file_name}`

    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from('project-documents')
      .createSignedUploadUrl(storagePath)

    if (signedError) throw new AppError(500, 'STORAGE_ERROR', signedError.message)

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/project-documents/${storagePath}`

    const { data: doc, error: docError } = await supabaseAdmin
      .from('project_documents')
      .insert({
        project_id,
        uploaded_by: req.user!.id,
        file_name: input.file_name,
        file_url: fileUrl,
        file_type: input.file_type,
        file_size_bytes: input.file_size_bytes,
      })
      .select()
      .single()

    if (docError) throw new AppError(500, 'DB_ERROR', docError.message)

    res.status(201).json({
      data: {
        document: doc,
        upload_url: signedData.signedUrl,
        token: signedData.token,
        path: storagePath,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params

    const { data: doc } = await supabaseAdmin
      .from('project_documents')
      .select('uploaded_by, file_url')
      .eq('id', id)
      .single()

    if (!doc) throw new AppError(404, 'NOT_FOUND', 'Document not found')

    if (doc.uploaded_by !== req.user!.id && req.user!.role !== 'partner') {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own documents')
    }

    const { error } = await supabaseAdmin.from('project_documents').delete().eq('id', id)
    if (error) throw new AppError(500, 'DB_ERROR', error.message)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
