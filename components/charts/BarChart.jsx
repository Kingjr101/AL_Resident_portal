'use client'
import ReactECharts from 'echarts-for-react'

// Evil-Charts style gradient bars with rounded caps + grow-on-mount animation.
// data: [{ name, value }]
export function BarChart({ data = [], horizontal = false, max = 5, height = 300 }) {
  const names = data.map(d => d.name)
  const values = data.map(d => d.value)
  const gradient = (dir) => ({
    type: 'linear',
    x: 0, y: 0, x2: horizontal ? 1 : 0, y2: horizontal ? 0 : 1,
    colorStops: [
      { offset: 0, color: horizontal ? '#F15A25' : '#F79A6E' },
      { offset: 1, color: horizontal ? '#F79A6E' : '#F15A25' },
    ],
  })
  const catAxis = {
    type: 'category',
    data: names,
    inverse: horizontal,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#5b5b57', fontSize: 12 },
  }
  const valAxis = {
    type: 'value',
    max: max || undefined,
    splitLine: { lineStyle: { color: '#EFEBE4' } },
    axisLabel: { color: '#B7B7B7', fontSize: 11 },
  }
  const option = {
    backgroundColor: 'transparent',
    grid: { left: horizontal ? 8 : 6, right: 16, top: 16, bottom: 6, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: horizontal ? valAxis : catAxis,
    yAxis: horizontal ? catAxis : valAxis,
    series: [{
      type: 'bar',
      data: values,
      barWidth: horizontal ? '58%' : '52%',
      itemStyle: {
        borderRadius: horizontal ? [0, 10, 10, 0] : [10, 10, 0, 0],
        color: gradient(),
        shadowBlur: 10,
        shadowColor: 'rgba(241,90,37,0.18)',
      },
      emphasis: { itemStyle: { color: '#F15A25' } },
    }],
    animationDuration: 1200,
    animationEasing: 'elasticOut',
    animationDelay: (idx) => idx * 90,
  }
  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'svg' }} />
}
