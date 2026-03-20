import type { Metadata } from "next";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your AI usage dashboard — tokens, costs, ROI, and insights.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
