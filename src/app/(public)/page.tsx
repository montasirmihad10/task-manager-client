"use client";

import HomeClose from "@/components/home/HomeClose";
import HomeFlow from "@/components/home/HomeFlow";
import HomeHero from "@/components/home/HomeHero";
import HomeLegal from "@/components/home/HomeLegal";
import HomeProduct from "@/components/home/HomeProduct";
import HomeRoles from "@/components/home/HomeRoles";
import {
  useGetLandingQuery,
  type ILandingContent,
} from "@/redux/api/landingApi";

export default function PublicHomePage() {
  const { data, isLoading } = useGetLandingQuery(undefined);
  const landing = (data?.data ?? null) as ILandingContent | null;

  if (isLoading && !landing) {
    return (
      <main className="min-h-svh bg-mist">
        <div className="skeleton h-[70vh] w-full" />
        <div className="mx-auto max-w-6xl space-y-4 px-5 py-16">
          <div className="skeleton h-10 w-1/2 rounded-xl" />
          <div className="skeleton h-24 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main>
      <HomeHero content={landing?.hero} stages={landing?.pipeline?.stages} />
      <HomeRoles content={landing?.roles} />
      <div id="product">
        <HomeProduct content={landing?.product} />
      </div>
      <HomeFlow content={landing?.pipeline} />
      <div id="policies">
        <HomeLegal content={landing?.legal} />
      </div>
      <HomeClose content={landing?.close} brand={landing?.hero?.brand} />
    </main>
  );
}
