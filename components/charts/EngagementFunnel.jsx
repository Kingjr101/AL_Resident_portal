'use client'
import ReactECharts from 'echarts-for-react'

// data: [{ name, value }]
export function EngagementFunnel({ data = [] }) {
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [{
      type: 'funnel',
      left: '4%', right: '4%', top: 10, bottom: 10,
      minSize: '26%', maxSize: '100%',
      sort: 'descending', gap: 5,
      label: { show: true, position: 'inside', color: '#fff', fontWeight: 700, fontSize: 13, formatter: '{b} — {c}' },
      labelLine: { show: false },
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      color: ['#F15A25', '#F26D3D', '#F58256', '#F79A6E', '#FBC0A3'],
      data,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
    }],
  }
  return <ReactECharts option={option} style={{ height: 300, width: '100%' }} opts={{ renderer: 'svg' }} />
}