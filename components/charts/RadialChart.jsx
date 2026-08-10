'use client'
import ReactECharts from 'echarts-for-react'

// Evil-Charts style animated radial ring, recoloured to brand tokens.
export function RadialChart({ value = 0, max = 5, height = 240, label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const option = {
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      radius: '92%',
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        width: 20,
        itemStyle: {
          shadowBlur: 14,
          shadowColor: 'rgba(241,90,37,0.45)',
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 1,
            colorStops: [
              { offset: 0, color: '#F79A6E' },
              { offset: 1, color: '#F15A25' },
            ],
          },
        },
      },
      axisLine: { lineStyle: { width: 20, color: [[1, '#F1E6DD']] } },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      anchor: { show: false },
      data: [{ value: pct }],
      detail: {
        valueAnimation: true,
        offsetCenter: [0, label ? '-6%' : 0],
        formatter: () => `{v|${value.toFixed(1)}}{u|/${max}}`,
        rich: {
          v: { fontSize: 40, fontWeight: 700, color: '#00430E', fontFamily: 'var(--font-fraunces), serif' },
          u: { fontSize: 16, color: '#B7B7B7', padding: [0, 0, 6, 2] },
        },
      },
      max: 100,
    }],
    animationDuration: 1400,
    animationEasing: 'cubicOut',
  }
  return (
    <div>
      <ReactECharts option={option} style={{ height, width: '100%' }} opts={{ renderer: 'svg' }} />
      {label ? <p className="text-center text-sm text-muted-foreground -mt-2">{label}</p> : null}
    </div>
  )
}
