import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimeInputs } from "./TimeInputs";

const createBetSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  days: z.coerce.number().min(0, "Days must be 0 or greater"),
  hours: z.coerce.number().min(0).max(23, "Hours must be between 0 and 23"),
  minutes: z.coerce.number().min(0).max(59, "Minutes must be between 0 and 59"),
});

export type CreateBetFormValues = z.infer<typeof createBetSchema>;

export const CreateBetForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CreateBetFormValues>({
    resolver: zodResolver(createBetSchema),
    defaultValues: {
      eventName: "",
      optionA: "",
      optionB: "",
      days: 0,
      hours: 0,
      minutes: 0,
    },
  });

  const onSubmit = async (data: CreateBetFormValues) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast({
          title: "Error",
          description: "You must be logged in to create a bet",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const now = new Date();
      const endTime = new Date(now.getTime() + 
        (data.days * 24 * 60 * 60 * 1000) + 
        (data.hours * 60 * 60 * 1000) + 
        (data.minutes * 60 * 1000)
      );

      const { error } = await supabase.from("bets").insert({
        event_name: data.eventName,
        option_a: data.optionA,
        option_b: data.optionB,
        end_time: endTime.toISOString(),
        pool_a: 0,
        pool_b: 0,
        is_resolved: false,
        created_by: sessionData.session.user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bet created successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error creating bet:", error);
      toast({
        title: "Error",
        description: "Failed to create bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter event name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="optionA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Option A</FormLabel>
              <FormControl>
                <Input placeholder="Enter first option" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="optionB"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Option B</FormLabel>
              <FormControl>
                <Input placeholder="Enter second option" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TimeInputs form={form} />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button type="submit">Create Bet</Button>
        </div>
      </form>
    </Form>
  );
};