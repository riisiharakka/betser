import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateBetFormValues } from "./CreateBetForm";

interface WagerFieldsProps {
  form: UseFormReturn<CreateBetFormValues>;
}

export const WagerFields = ({ form }: WagerFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="maxBetSize"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Maximum Bet Size (Optional)</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              placeholder="Enter maximum bet size" 
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Leave empty for no maximum bet size limit
          </FormDescription>
        </FormItem>
      )}
    />
  );
};