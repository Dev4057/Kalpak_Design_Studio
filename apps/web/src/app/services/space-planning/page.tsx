import type { Metadata } from 'next'
import ServicePageTemplate, { type ServiceContent } from '@/components/services/ServicePageTemplate'

export const metadata: Metadata = {
  title: 'Space Planning',
  description:
    'Professional space planning services that optimise your floor plan for flow, functionality, and spatial harmony.',
}

const content: ServiceContent = {
  title: 'Space Planning',
  tagline: 'Our Services',
  heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
  description:
    "A beautifully furnished room means nothing if the layout doesn't work. Space planning is the invisible backbone of any great interior — and it's one of the most underappreciated services in design. We analyse your space, understand how you live or work in it, and create layouts that feel effortless, open, and entirely logical.",
  whatWeOffer: [
    {
      title: 'Floor Plan Optimisation',
      description:
        'Analysing and redesigning your existing floor plan to improve traffic flow, natural light, and room relationships.',
    },
    {
      title: 'Furniture Layout Plans',
      description:
        'Scaled furniture plans that show exactly where every piece goes — before a single item is purchased or moved.',
    },
    {
      title: 'Zoning & Circulation',
      description:
        'Defining distinct zones for living, working, and relaxing while ensuring comfortable circulation throughout.',
    },
    {
      title: '3D Spatial Visualisation',
      description:
        "Three-dimensional renders of your space so you can experience the layout before it's executed.",
    },
  ],
  process: [
    {
      num: '01',
      title: 'Space Audit',
      desc: 'Site visit, measurements, and a thorough understanding of how you use the space today.',
    },
    {
      num: '02',
      title: 'Layout Options',
      desc: 'Multiple layout options presented with pros and cons, so you choose what works best for you.',
    },
    {
      num: '03',
      title: 'Final Plans',
      desc: 'Finalised, dimensioned floor plans and 3D views ready for execution.',
    },
  ],
  projectType: 'office',
}

export default function SpacePlanningPage() {
  return <ServicePageTemplate content={content} />
}
