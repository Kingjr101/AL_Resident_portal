'use client'
import ReactECharts from 'echarts-for-react'

// Evil-Charts style radar with brand gradient area fill + mount animation.
// indicators: [{ name, max }], values: number[]
export function RadarChart({ indicators = [], values = [], height = 320 }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    radar: {
      indicator: indicators,
      radius: '68%',
      splitNumber: 5,
      axisName: { color: '#00430E', fontSize: 12, fontWeight: 600 },
      splitLine: { lineStyle: { color: '#E6DED3' } },
      splitArea: { areaStyle: { color: ['rgba(250,250,247,0.4)', 'rgba(241,90,37,0.04)'] } },
      axisLine: { lineStyle: { color: '#E6DED3' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        name: 'Average score',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#F15A25', width: 2 },
        itemStyle: { color: '#F15A25', shadowBlur: 8, shadowColor: 'rgba(241,90,37,0.4)' },
        areaStyle: {
          color: {
            type: 'radial', x: 0.5, y: 0.5, r: 0.7,
            colorStops: [
              { offset: 0, color: 'rgba(241,90,37,0.35)' },
              { offset: 1, color: 'rgba(0,67,14,0.18)' },
            ],
          },
        },
      }],
    }],
    animationDuration: 1400,
    animationEasing: 'cubicOut',
  }
  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'svg' }} />
}
