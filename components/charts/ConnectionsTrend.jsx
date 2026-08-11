'use client'
import ReactECharts from 'echarts-for-react'

// points: [{ week, value }]
export function ConnectionsTrend({ points = [] }) {
  const names = points.map(p => p.week)
  const values = points.map(p => p.value)
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 8, right: 16, top: 20, bottom: 6, containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: false, data: names,
      axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#8a8a85' },
    },
    yAxis: {
      type: 'value', splitLine: { lineStyle: { color: '#F1EDE6' } }, axisLabel: { color: '#b7b7b7' },
    },
    series: [{
      type: 'line', smooth: true, data: values, symbol: 'circle', symbolSize: 7,
      lineStyle: { width: 3, color: '#F15A25' },
      itemStyle: { color: '#F15A25' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(241,90,37,0.35)' },
            { offset: 1, color: 'rgba(241,90,37,0.02)' },
          ],
        },
      },
      animationDuration: 1200,
    }],
  }
  return <ReactECharts option={option} style={{ height: 280, width: '100%' }} opts={{ renderer: 'svg' }} />
}