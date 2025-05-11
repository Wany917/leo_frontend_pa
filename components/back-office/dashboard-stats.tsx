import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, CreditCard, TrendingUp } from "lucide-react"

export function DashboardStats() {
  const stats = [
    {
      title: "Ventes totales",
      value: "€12,234",
      icon: CreditCard,
      description: "+12% par rapport au mois dernier",
      trend: "up",
    },
    {
      title: "Nouveaux clients",
      value: "432",
      icon: Users,
      description: "+8% par rapport au mois dernier",
      trend: "up",
    },
    {
      title: "Produits vendus",
      value: "1,234",
      icon: ShoppingCart,
      description: "+23% par rapport au mois dernier",
      trend: "up",
    },
    {
      title: "Taux de conversion",
      value: "3.2%",
      icon: TrendingUp,
      description: "+1.1% par rapport au mois dernier",
      trend: "up",
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

