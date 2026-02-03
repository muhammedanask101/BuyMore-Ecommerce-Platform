import slugify from 'slugify';

export function generateSlug(name: string) {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function generateShortDescription(description?: string) {
  if (!description) return undefined;
  return description.slice(0, 140);
}

export function generateSEO({
  name,
  shortDescription,
}: {
  name: string;
  shortDescription?: string;
}) {
  return {
    title: `${name} | BuyMore`,
    description: shortDescription,
  };
}
