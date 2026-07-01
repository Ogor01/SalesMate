import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import OverviewPage from "../_components/OverviewPage";
import AnalyticsPage from "../_components/AnalyticsPage";
import ProductsPage from "../_components/ProductsPage";
import KnowledgeBasePage from "../_components/KnowledgeBasePage";
import ConversationsPage from "../_components/ConversationsPage";
import LeadsPage from "../_components/LeadsPage";
import SettingsPage from "../_components/SettingsPage";

const pageRegistry: Record<string, React.ComponentType<any>> = {
  dashboard: OverviewPage,
  analytics: AnalyticsPage,
  products: ProductsPage,
  "knowledge-base": KnowledgeBasePage,
  conversations: ConversationsPage,
  leads: LeadsPage,
  settings: SettingsPage,
};

export default async function DashboardPageRouter({
  params,
}: {
  params: { slug?: string[] };
}) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    redirect("/login");
  }

  const pageSlug = params.slug?.[0];

  if (!pageSlug || !(pageSlug in pageRegistry)) {
    notFound();
  }

  const PageComponent = pageRegistry[pageSlug];
  return <PageComponent userId={userId} />;
}
