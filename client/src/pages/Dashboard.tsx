import { HousePlus, Plus, House, CircleArrowRight } from "lucide-react";
import AddPropertyForm from "../components/add-property-form";
import { useState } from "react";
const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-6 rounded-full bg-primary/10 mb-6">
          <HousePlus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Welcome to Your Dashboard
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Get started by adding your first property. A property represents a
          building or complex where you manage rental units.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover transition"
          >
            <Plus className="h-4 w-4" />
            Add Property Your First Property
          </button>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
          <div className="rounded-lg bg-card border text-card-foreground shadow-sm text-left ">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <HousePlus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-lg">
                1. Add properties
              </h3>
              <div className="p-6 pt-0">
                <p className="text-sm text-muted-foreground">
                  Create properties for each building or complex you manage.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-card border text-card-foreground shadow-sm text-left ">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <House className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-lg">
                2. Add Houses/Units
              </h3>
              <div className="p-6 pt-0">
                <p className="text-sm text-muted-foreground">
                  Add individual rental units to each property with rent
                  amounts.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-card border text-card-foreground shadow-sm text-left ">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                <CircleArrowRight className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold tracking-tight text-lg">
                3. Track Payments
              </h3>
              <div className="p-6 pt-0">
                <p className="text-sm text-muted-foreground">
                  Monitor rent collection and tenant payments in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="relative max-w-lg w-full p-4 px-6 mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200">
            <AddPropertyForm
              onSuccess={() => setIsModalOpen(false)}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
