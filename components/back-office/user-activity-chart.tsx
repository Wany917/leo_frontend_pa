"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UserActivityChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return

    // Données fictives pour le graphique
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    const newUsers = [120, 150, 180, 220, 250, 190, 160]
    const activeUsers = [450, 520, 550, 600, 580, 450, 400]

    // Dessiner le graphique
    const drawChart = () => {
      if (!ctx || !canvasRef.current) return

      const width = canvasRef.current.width
      const height = canvasRef.current.height
      const padding = 40
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2
      const maxValue = Math.max(...activeUsers) * 1.1
      const pointSpacing = chartWidth / (days.length - 1)

      // Effacer le canvas
      ctx.clearRect(0, 0, width, height)

      // Dessiner la grille
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.strokeStyle = "#e2e8f0"
        ctx.stroke()

        // Ajouter les valeurs sur l'axe Y
        ctx.fillStyle = "#64748b"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "right"
        ctx.fillText(`${Math.round((maxValue / 5) * (5 - i))}`, padding - 10, y + 3)
      }

      // Dessiner l'axe X
      days.forEach((day, index) => {
        const x = padding + index * pointSpacing

        // Ajouter le jour
        ctx.fillStyle = "#64748b"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(day, x, height - padding + 20)
      })

      // Dessiner la ligne des utilisateurs actifs
      ctx.beginPath()
      activeUsers.forEach((value, index) => {
        const x = padding + index * pointSpacing
        const y = padding + chartHeight - (value / maxValue) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Dessiner les points des utilisateurs actifs
      activeUsers.forEach((value, index) => {
        const x = padding + index * pointSpacing
        const y = padding + chartHeight - (value / maxValue) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#3b82f6"
        ctx.fill()
      })

      // Dessiner la ligne des nouveaux utilisateurs
      ctx.beginPath()
      newUsers.forEach((value, index) => {
        const x = padding + index * pointSpacing
        const y = padding + chartHeight - (value / maxValue) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.stroke()

      // Dessiner les points des nouveaux utilisateurs
      newUsers.forEach((value, index) => {
        const x = padding + index * pointSpacing
        const y = padding + chartHeight - (value / maxValue) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "#10b981"
        ctx.fill()
      })

      // Légende
      const legendY = padding + 20

      // Utilisateurs actifs
      ctx.beginPath()
      ctx.moveTo(width - padding - 100, legendY)
      ctx.lineTo(width - padding - 70, legendY)
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(width - padding - 85, legendY, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()

      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("Actifs", width - padding - 60, legendY + 4)

      // Nouveaux utilisateurs
      ctx.beginPath()
      ctx.moveTo(width - padding - 100, legendY + 20)
      ctx.lineTo(width - padding - 70, legendY + 20)
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(width - padding - 85, legendY + 20, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#10b981"
      ctx.fill()

      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("Nouveaux", width - padding - 60, legendY + 24)
    }

    drawChart()

    // Redessiner le graphique lors du redimensionnement
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth
        canvasRef.current.height = canvasRef.current.offsetHeight
        drawChart()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Activité utilisateurs</CardTitle>
        <Select defaultValue="week">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pl-2">
        <canvas ref={canvasRef} width={500} height={300} className="w-full h-[300px]" />
      </CardContent>
    </Card>
  )
}

