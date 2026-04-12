import { redirect } from "next/navigation";

function buildQueryString(params) {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export default async function LegacySignInPage({ searchParams }) {
  const params = await searchParams;
  redirect(`/login${buildQueryString(params)}`);
}
