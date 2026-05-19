import type { Metadata } from 'next'
import ServicePageTemplate, { type ServiceContent } from '@/components/services/ServicePageTemplate'

export const metadata: Metadata = {
  title: 'Interior Design',
  description:
    'Premium interior design services for residential and commercial spaces. Curated aesthetics, functional layouts, and exceptional execution.',
}

const content: ServiceContent = {
  title: 'Interior Design',
  tagline: 'Our Services',
  heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80',
  description:
    'We create interiors that are the perfect expression of your personality and aspirations. Our design approach balances beauty with practicality — every space we touch is both stunning and deeply liveable. From mood-boarding and material selection to furniture curation and styling, we handle every detail so you can simply enjoy the result.',
  whatWeOffer: [
    {
      title: 'Concept Development',
      description:
        'We translate your brief into a cohesive design concept with mood boards, spatial plans, and material palettes that set the tone for the entire project.',
    },
    {
      title: 'Space Planning',
      description:
        'Thoughtful furniture layouts that optimise flow, natural light, and functionality — making every square foot feel intentional.',
    },
    {
      title: 'Material & Finish Selection',
      description:
        'Curated selections of flooring, wall finishes, fabrics, and surface materials — sourced from trusted suppliers across India and internationally.',
    },
    {
      title: 'Furniture & Styling',
      description:
        'Custom furniture specifications and procurement, finished with art, accessories, and soft furnishings that complete the look.',
    },
  ],
  process: [
    {
      num: '01',
      title: 'Consultation',
      desc: 'We understand your lifestyle, brief, and budget through an in-depth initial meeting.',
    },
    {
      num: '02',
      title: 'Design Concept',
      desc: 'Mood boards, floor plans, and concept direction presented for your feedback.',
    },
    {
      num: '03',
      title: 'Final Design & Handover',
      desc: 'Detailed drawings, vendor coordination, and complete project delivery.',
    },
  ],
  projectType: 'residential',
}

export default function InteriorDesignPage() {
  return <ServicePageTemplate content={content} />
}
