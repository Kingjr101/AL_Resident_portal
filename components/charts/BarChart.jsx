'use client'
import ReactECharts from 'echarts-for-react'

// Evil-Charts style gradient bars with rounded caps + grow-on-mount animation.
// Each bar's color intensity scales with its rank so the chart never looks flat.
// data: [{ name, value }]
export function BarChart({ data = [], horizontal = false, max = 5, height = 300, showLabels = true }) {
  const names = data.map(d => d.name)
  const values = data.map(d => d.value)
  const maxVal = Math.max(...values, 1)
  const minVal = Math.min(...values, 0)

  // Per-bar gradient: high values = deep orange, low = pale peach.
  const barColor = (val) => {
    const r = maxVal === minVal ? 1 : (val - minVal) / (maxVal - minVal)
    // interpolate lightness: strong bars darker/saturated, weak bars lighter
    const strong = { start: '#F15A25', end: '#C8431A' }   // top bars
    const weak   = { start: '#FBC9B0', end: '#F79A6E' }   // bottom bars
    const pick = (a, b) => (r > 0.5 ? a : b)
    return {
      type: 'linear',
      x: 0, y: 0, x2: horizontal ? 1 : 0, y2: horizontal ? 0 : 1,
      colorStops: [
        { offset: 0, color: horizontal ? pick(strong.start, weak.start) : pick(strong.end, weak.end) },
        { offset: 1, color: horizontal ? pick(strong.end, weak.end) : pick(strong.start, weak.start) },
      ],
    }
  }

  const seriesData = values.map((v) => ({
    value: v,
    itemStyle: {
      borderRadius: horizontal ? [0, 10, 10, 0] : [10, 10, 0, 0],
      color: barColor(v),
      shadowBlur: 12,
      shadowColor: 'rgba(241,90,37,0.22)',
    },
  }))

  const catAxis = {
    type: 'category',
    data: names,
    inverse: horizontal,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#5b5b57', fontSize: 12, fontWeight: 500 },
  }
  const valAxis = {
    type: 'value',
    max: max || undefined,
    splitLine: { lineStyle: { color: '#EFEBE4' } },
    axisLabel: { color: '#B7B7B7', fontSize: 11 },
  }

  const option = {
    backgroundColor: 'transparent',
    grid: { left: horizontal ? 8 : 6, right: horizontal ? 40 : 16, top: 16, bottom: 6, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: horizontal ? valAxis : catAxis,
    yAxis: horizontal ? catAxis : valAxis,
    series: [{
      type: 'bar',
      data: seriesData,
      barWidth: horizontal ? '62%' : '54%',
      label: showLabels ? {
        show: true,
        position: horizontal ? 'right' : 'top',
        color: '#00430E',
        fontSize: 12,
        fontWeight: 700,
        formatter: '{c}',
      } : undefined,
      emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(241,90,37,0.4)' } },
    }],
    animationDuration: 1100,
    animationEasing: 'elasticOut',
    animationDelay: (idx) => idx * 90,
  }

  return <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'svg' }} />
}