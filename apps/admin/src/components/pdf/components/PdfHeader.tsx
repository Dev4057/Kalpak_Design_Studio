import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from '../styles'

interface PdfHeaderProps {
  reportTitle: string
  reportSubtitle?: string
}

export function PdfHeader({ reportTitle, reportSubtitle }: PdfHeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.firmName}>KALPAK DESIGN STUDIO</Text>
      <Text style={pdfStyles.firmTagline}>Interior Design &amp; Architecture</Text>
      <View style={pdfStyles.divider} />
      <Text style={pdfStyles.reportTitle}>{reportTitle}</Text>
      {reportSubtitle && <Text style={pdfStyles.reportSubtitle}>{reportSubtitle}</Text>}
    </View>
  )
}
