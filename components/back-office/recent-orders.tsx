"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function RecentOrders() {
  const [searchQuery, setSearchQuery] = useState("")

  // Données fictives pour les commandes
  const orders = [
    {
      id: "ORD-001",
      customer: "Jean Dupont",
      status: "Complété",
      date: "2023-10-15",
      total: "€129.99",
    },
    {
      id: "ORD-002",
      customer: "Marie Martin",
      status: "En cours",
      date: "2023-10-14",
      total: "€59.99",
    },
    {
      id: "ORD-003",
      customer: "Pierre Durand",
      status: "En attente",
      date: "2023-10-14",
      total: "€89.50",
    },
    {
      id: "ORD-004",
      customer: "Sophie Lefebvre",
      status: "Complété",
      date: "2023-10-13",
      total: "€199.99",
    },
    {
      id: "ORD-005",
      customer: "Lucas Bernard",
      status: "Annulé",
      date: "2023-10-12",
      total: "€45.00",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complété":
        return "bg-green-100 text-green-800"
      case "En cours":
        return "bg-blue-100 text-blue-800"
      case "En attente":
        return "bg-yellow-100 text-yellow-800"
      case "Annulé":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>Gérez vos commandes récentes et leur statut.</CardDescription>
          </div>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[250px]"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button variant="outline" size="sm">
            Suivant
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

