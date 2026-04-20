'use client'

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { MonthlyStats } from '@/lib/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props { data: MonthlyStats[] }

export default function GrowthChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.month_order - b.month_order)
  const labels = sorted.map(d => d.month_label)

  const datasets = [
    {
      label: 'Clients estimés',
      data: sorted.map(d => d.estimated_clients),
      borderColor: '#00E0B8',
      backgroundColor: 'rgba(0,224,184,0.08)',
      fill: true,
      tension: 0.45,
      pointBackgroundColor: '#00E0B8',
      pointBorderColor: '#0F1620',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
    },
    {
      label: 'Vues TikTok (÷1K)',
      data: sorted.map(d => Math.round(d.tiktok_views / 1000)),
      borderColor: '#00C2FF',
      backgroundColor: 'rgba(0,194,255,0.06)',
      fill: true,
      tension: 0.45,
      pointBackgroundColor: '#00C2FF',
      pointBorderColor: '#0F1620',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
    },
    {
      label: 'Abonnés gagnés',
      data: sorted.map(d => d.followers_gained),
      borderColor: '#7B61FF',
      backgroundColor: 'rgba(123,97,255,0.05)',
      fill: false,
      tension: 0.45,
      pointBackgroundColor: '#7B61FF',
      pointBorderColor: '#0F1620',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
    },
  ]

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#8892A4',
          font: { family: 'Inter', size: 11 },
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#0B0F1A',
        borderColor: 'rgba(0,194,255,0.2)',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#8892A4',
        padding: 12,
        titleFont: { family: 'Poppins', weight: 'bold' as const, size: 13 },
        bodyFont: { family: 'Inter', size: 12 },
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid:   { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks:  { color: '#8892A4', font: { family: 'Inter', size: 11 } },
        border: { display: false },
      },
      y: {
        grid:   { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks:  { color: '#8892A4', font: { family: 'Inter', size: 11 } },
        border: { display: false },
        beginAtZero: true,
      },
    },
  }

  if (!data.length) return null

  return (
    <div className="relative">
      <Line data={{ labels, datasets }} options={options}/>
    </div>
  )
}
