import { CreateBetForm } from "@/components/create-bet/CreateBetForm";

const CreateBet = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Bet</h1>
          <p className="text-muted-foreground">
            Set up a new betting event with two options
          </p>
        </div>

        <CreateBetForm />
      </div>
    </div>
  );
};

export default CreateBet;