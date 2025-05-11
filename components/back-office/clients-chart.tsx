"use client"

import { useEffect, useRef } from "react"

export function ClientsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    setCanvasDimensions()

    // Data for the chart
    const xLabels = ["5k", "10k", "15k", "20k", "25k", "30k", "35k", "40k", "45k", "50k", "55k", "60k"]
    const newClientsData = [
      { x: 0, y: 25 },
      { x: 1, y: 30 },
      { x: 2, y: 32 },
      { x: 3, y: 28 },
      { x: 4, y: 40 },
      { x: 5, y: 55 },
      { x: 6, y: 80 },
      { x: 7, y: 60 },
      { x: 8, y: 45 },
      { x: 9, y: 65 },
      { x: 10, y: 55 },
      { x: 11, y: 58 },
    ]

    const repeatedClientsData = [
      { x: 0, y: 40 },
      { x: 1, y: 65 },
      { x: 2, y: 45 },
      { x: 3, y: 35 },
      { x: 4, y: 50 },
      { x: 5, y: 40 },
      { x: 6, y: 55 },
      { x: 7, y: 60 },
      { x: 8, y: 40 },
      { x: 9, y: 35 },
      { x: 10, y: 70 },
      { x: 11, y: 90 },
    ]

    // Chart dimensions
    const chartWidth = canvas.width
    const chartHeight = canvas.height
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const graphWidth = chartWidth - padding.left - padding.right
    const graphHeight = chartHeight - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, chartWidth, chartHeight)

    // Draw y-axis grid lines and labels
    ctx.beginPath()
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    const yGridCount = 5
    const yGridStep = graphHeight / yGridCount

    for (let i = 0; i <= yGridCount; i++) {
      const y = padding.top + i * yGridStep
      ctx.moveTo(padding.left, y)
      ctx.lineTo(chartWidth - padding.right, y)

      // Y-axis labels
      ctx.fillStyle = "#9ca3af"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(`${100 - i * 20}`, padding.left - 10, y)
    }
    ctx.stroke()

    // Draw x-axis labels
    ctx.fillStyle = "#9ca3af"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    const xStep = graphWidth / (xLabels.length - 1)
    xLabels.forEach((label, i) => {
      const x = padding.left + i * xStep
      ctx.fillText(label, x, padding.top + graphHeight + 10)
    })

    // Function to draw area chart
    const drawAreaChart = (data: { x: number; y: number }[], color: string, fillColor: string) => {
      const xStep = graphWidth / (data.length - 1)

      // Draw the area
      ctx.beginPath()
      ctx.moveTo(padding.left, padding.top + graphHeight)

      data.forEach((point, i) => {
        const x = padding.left + i * xStep
        const y = padding.top + graphHeight - (point.y / 100) * graphHeight

        if (i === 0) {
          ctx.lineTo(x, y)
        } else {
          // Create smooth curve
          const prevPoint = data[i - 1]
          const prevX = padding.left + (i - 1) * xStep
          const prevY = padding.top + graphHeight - (prevPoint.y / 100) * graphHeight

          const cpX1 = prevX + xStep / 3
          const cpX2 = x - xStep / 3

          ctx.bezierCurveTo(cpX1, prevY, cpX2, y, x, y)
        }
      })

      // Complete the area
      ctx.lineTo(padding.left + (data.length - 1) * xStep, padding.top + graphHeight)
      ctx.lineTo(padding.left, padding.top + graphHeight)
      ctx.closePath()

      // Fill the area
      ctx.fillStyle = fillColor
      ctx.fill()

      // Draw the line
      ctx.beginPath()
      data.forEach((point, i) => {
        const x = padding.left + i * xStep
        const y = padding.top + graphHeight - (point.y / 100) * graphHeight

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          // Create smooth curve
          const prevPoint = data[i - 1]
          const prevX = padding.left + (i - 1) * xStep
          const prevY = padding.top + graphHeight - (prevPoint.y / 100) * graphHeight

          const cpX1 = prevX + xStep / 3
          const cpX2 = x - xStep / 3

          ctx.bezierCurveTo(cpX1, prevY, cpX2, y, x, y)
        }
      })

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw the charts
    drawAreaChart(repeatedClientsData, "#D8B4FE", "rgba(216, 180, 254, 0.5)")
    drawAreaChart(newClientsData, "#F8A097", "rgba(248, 160, 151, 0.5)")

    // Handle resize
    const handleResize = () => {
      setCanvasDimensions()

      // Redraw the chart
      ctx.clearRect(0, 0, chartWidth, chartHeight)

      // Draw y-axis grid lines and labels
      ctx.beginPath()
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 1

      for (let i = 0; i <= yGridCount; i++) {
        const y = padding.top + i * yGridStep
        ctx.moveTo(padding.left, y)
        ctx.lineTo(chartWidth - padding.right, y)

        // Y-axis labels
        ctx.fillStyle = "#9ca3af"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "right"
        ctx.textBaseline = "middle"
        ctx.fillText(`${100 - i * 20}`, padding.left - 10, y)
      }
      ctx.stroke()

      // Draw x-axis labels
      ctx.fillStyle = "#9ca3af"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      xLabels.forEach((label, i) => {
        const x = padding.left + i * xStep
        ctx.fillText(label, x, padding.top + graphHeight + 10)
      })

      // Draw the charts
      drawAreaChart(repeatedClientsData, "#D8B4FE", "rgba(216, 180, 254, 0.5)")
      drawAreaChart(newClientsData, "#F8A097", "rgba(248, 160, 151, 0.5)")
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

