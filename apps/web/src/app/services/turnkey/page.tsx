import type { Metadata } from 'next'
import ServicePageTemplate, { type ServiceContent } from '@/components/services/ServicePageTemplate'

export const metadata: Metadata = {
  title: 'Turnkey Projects',
  description:
    'Complete end-to-end interior project delivery. From design to handover — one team, one point of accountability.',
}

const content: ServiceContent = {
  title: 'Turnkey Projects',
  tagline: 'Our Services',
  heroImage: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1920&q=80',
  description:
    "Our turnkey service takes complete ownership of your project — from the first design sketch to the day you walk in and turn the key. We coordinate every trade, vendor, and contractor so you don't have to. One number to call. One team accountable for the outcome. A fixed timeline and a transparent budget from day one.",
  whatWeOffer: [
    {
      title: 'Complete Project Management',
      description:
        'A dedicated project manager oversees every aspect — scheduling, procurement, contractor coordination, and quality control.',
    },
    {
      title: 'Civil & MEP Works',
      description:
        'Plumbing, electrical, HVAC, and civil modifications handled by our trusted network of skilled contractors.',
    },
    {
      title: 'Custom Furniture & Joinery',
      description:
        'In-house fabrication management for modular kitchens, wardrobes, cabinetry, and bespoke furniture pieces.',
    },
    {
      title: 'Fixed-Price Commitment',
      description:
        'A detailed BOQ and fixed-price contract before work begins — no surprise costs mid-project.',
    },
  ],
  process: [
    {
      num: '01',
      title: 'Design & BOQ',
      desc: 'Complete design finalisation followed by a detailed Bill of Quantities and fixed project cost.',
    },
    {
      num: '02',
      title: 'Execution',
      desc: 'Coordinated site execution with dedicated project management and weekly progress updates.',
    },
    {
      num: '03',
      title: 'Snag & Handover',
      desc: 'Systematic snagging, punch list resolution, and a formal handover walkthrough.',
    },
  ],
  projectType: 'residential',
}

export default function TurnkeyPage() {
  return <ServicePageTemplate content={content} />
}
