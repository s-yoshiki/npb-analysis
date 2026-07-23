/**
 * One heading treatment for every top-level page, so the h1 size, the kicker
 * and the lead paragraph never drift between routes.
 */
export function PageHeader({
  description,
  kicker,
  title,
}: {
  description: string;
  kicker: string;
  title: string;
}) {
  return (
    <div>
      <p className="section-kicker">{kicker}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
