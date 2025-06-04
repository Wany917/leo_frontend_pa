"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ResponsiveTableWrapper } from "@/components/back-office/responsive-table-wrapper"
import { useLanguage } from "@/components/language-context"

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
  const { t } = useLanguage()
  return (
    <ResponsiveTableWrapper>
      <Table>
        <TableHeader>
          <TableRow className="bg-white">
            <TableHead className="font-medium">{t("admin.client")}</TableHead>
            <TableHead className="font-medium">{t("admin.userContract")}</TableHead>
            <TableHead className="font-medium">{t("admin.price")}</TableHead>
            <TableHead className="font-medium">{t("admin.invoice")}</TableHead>
            <TableHead className="font-medium">{t("admin.paymentStatus")}</TableHead>
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

