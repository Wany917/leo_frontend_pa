"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ResponsiveTableWrapper } from "@/components/back-office/responsive-table-wrapper"

interface ContractData {
  id: number
  client: string
  contract: string
  price: string
}

interface ContractsTableProps {
  data: ContractData[]
}

export function ContractsTable({ data }: ContractsTableProps) {
  return (
    <ResponsiveTableWrapper>
      <Table>
        <TableHeader>
          <TableRow className="bg-white">
            <TableHead className="font-medium">Client</TableHead>
            <TableHead className="font-medium">Contract</TableHead>
            <TableHead className="font-medium">Price</TableHead>
            <TableHead className="font-medium">Invoice</TableHead>
            <TableHead className="font-medium">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell>{contract.client}</TableCell>
              <TableCell>{contract.contract}</TableCell>
              <TableCell>{contract.price}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="bg-[#8CD790] hover:bg-[#7ac57e] text-white border-none">
                  Preview
                </Button>
              </TableCell>
              <TableCell>
                <span className="px-3 py-1 rounded-md text-sm bg-[#8CD790] text-white">Paid</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ResponsiveTableWrapper>
  )
}

