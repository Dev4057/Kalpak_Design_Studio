import type { Metadata } from 'next'
import ServicePageTemplate, { type ServiceContent } from '@/components/services/ServicePageTemplate'

export const metadata: Metadata = {
  title: 'Architecture',
  description:
    'Architectural design services that balance form, function, and context. From residential homes to commercial buildings across India.',
}

const content: ServiceContent = {
  title: 'Architecture',
  tagline: 'Our Services',
  heroImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80',
  description:
    'Our architectural practice is grounded in a belief that great buildings respond to their context, serve their occupants, and stand the test of time. We work closely with clients from the earliest sketches through to the day they move in — bringing clarity, craftsmanship, and care to every stage of the process.',
  whatWeOffer: [
    {
      title: 'Architectural Design',
      description:
        'Conceptual through to construction drawings — comprehensive design documentation for residential and commercial projects.',
    },
    {
      title: 'Regulatory Approvals',
      description:
        'We manage RERA, municipal, and local authority approvals, ensuring your project moves forward without delays.',
    },
    {
      title: 'Structural Coordination',
      description:
        'Close collaboration with structural engineers to ensure the design is buildable, safe, and cost-efficient.',
    },
    {
      title: 'Site Supervision',
      description:
        'Regular site visits and contractor coordination to maintain design intent and construction quality throughout.',
    },
  ],
  process: [
    {
      num: '01',
      title: 'Brief & Site Analysis',
      desc: 'Understanding your requirements and studying the site, zoning, and context before we design a single line.',
    },
    {
      num: '02',
      title: 'Concept & Schematic',
      desc: 'Architectural concept, spatial organisation, and schematic design for client review and approval.',
    },
    {
      num: '03',
      title: 'Drawings & Construction',
      desc: 'Complete working drawings, regulatory submissions, and on-site supervision through to completion.',
    },
  ],
  projectType: 'commercial',
}

export default function ArchitecturePage() {
  return <ServicePageTemplate content={content} />
}
