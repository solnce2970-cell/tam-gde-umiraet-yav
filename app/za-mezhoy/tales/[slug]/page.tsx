import { SECRET_STORY_IDS } from "../../../../lib/secret-stories";
import SecretStoryClient from "./SecretStoryClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECRET_STORY_IDS.map((slug) => ({ slug }));
}

export default async function SecretStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SecretStoryClient slug={slug} />;
}
