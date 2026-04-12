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

export default async function LegacySignUpPage({ searchParams }) {
  const params = await searchParams;
  redirect(`/create-account${buildQueryString(params)}`);
}
