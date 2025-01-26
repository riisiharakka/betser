import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BetPlacement {
  option: string;
  amount: number;
  created_at: string;
}

interface BetPlacementsProps {
  placements: BetPlacement[];
}

export const BetPlacements = ({ placements }: BetPlacementsProps) => {
  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Option</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placements.map((placement, index) => (
            <TableRow key={index}>
              <TableCell>Option {placement.option}</TableCell>
              <TableCell>€{placement.amount.toFixed(2)}</TableCell>
              <TableCell>
                {format(new Date(placement.created_at), "HH:mm d.M.")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};