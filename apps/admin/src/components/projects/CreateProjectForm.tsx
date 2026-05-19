'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { CreateProjectSchema, type CreateProjectInput } from '@kalpak/shared'
import { useCreateProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function CreateProjectForm() {
  const router = useRouter()
  const createProject = useCreateProject()

  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: { status: 'lead', is_published: false },
  })

  async function onSubmit(data: CreateProjectInput) {
    const result = await createProject.mutateAsync({
      ...data,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      expected_end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
    })
    const project = (result as { data: { id: string } }).data
    router.push(`/projects/${project.id}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Name */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="name">Project Name *</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Sharma Residence" />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>

        {/* Project Type */}
        <div className="space-y-1.5">
          <Label>Project Type</Label>
          <Select onValueChange={(v) => setValue('project_type', v as CreateProjectInput['project_type'])}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            defaultValue="lead"
            onValueChange={(v) => setValue('status', v as CreateProjectInput['status'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="snagging">Snagging</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} placeholder="Mumbai" />
        </div>

        {/* Total Budget */}
        <div className="space-y-1.5">
          <Label htmlFor="total_budget">Total Budget</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">₹</span>
            <Input
              id="total_budget"
              type="number"
              className="pl-7"
              placeholder="5000000"
              {...register('total_budget', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1.5">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'dd MMM yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Expected End Date */}
        <div className="space-y-1.5">
          <Label>Expected End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'dd MMM yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Address */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" {...register('address')} placeholder="Full address" rows={2} />
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Project description, scope, special requirements…"
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={createProject.isPending}>
          {createProject.isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
          Create Project
        </Button>
      </div>
    </form>
  )
}
