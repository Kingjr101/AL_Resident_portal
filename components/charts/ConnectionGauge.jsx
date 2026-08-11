'use client'
import ReactECharts from 'echarts-for-react'

// Animated index gauge. Works for any scale via `max` + `label`.
export function ConnectionGauge({ value = 0, max = 100, label = `out of ${max}` }) {
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 200, endAngle: -20,
      min: 0, max,
      radius: '92%',
      center: ['50%', '58%'],
      progress: {
        show: true, width: 16, roundCap: true,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#F15A25' },
              { offset: 1, color: '#00430E' },
            ],
          },
        },
      },
      axisLine: { roundCap: true, lineStyle: { width: 16, color: [[1, '#F1EDE6']] } },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      anchor: { show: false },
      title: { show: true, offsetCenter: [0, '32%'], color: '#8a8a85', fontSize: 12 },
      detail: {
        valueAnimation: true, fontSize: 40, fontWeight: 'bolder',
        color: '#00430E', offsetCenter: [0, '2%'],
        formatter: (v) => Number.isInteger(v) ? v : v.toFixed(2).replace(/\.?0+$/, ''),
      },
      data: [{ value, name: label }],
    }],
  }
  return <ReactECharts option={option} style={{ height: 200, width: '100%' }} opts={{ renderer: 'svg' }} />
}