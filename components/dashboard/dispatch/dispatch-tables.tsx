import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DispatchTablesProps {
  data: any
}

export function DispatchTables({ data }: DispatchTablesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Complete Dispatch Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Complete Dispatch Orders</CardTitle>
          <CardDescription>Successfully dispatched orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No.</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders
                .filter((order) => order.status === "yes")
                .slice(0, 5)
                .map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{order.orderNo}</TableCell>
                    <TableCell>{order.company}</TableCell>
                    <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Complete
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Dispatch Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-yellow-600">Pending Dispatch Orders</CardTitle>
          <CardDescription>Orders awaiting dispatch</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No.</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders
                .filter((order) => order.status !== "yes" && order.status !== "order cancel")
                .slice(0, 5)
                .map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{order.orderNo}</TableCell>
                    <TableCell>{order.company}</TableCell>
                    <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
