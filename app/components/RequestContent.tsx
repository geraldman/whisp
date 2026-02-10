export default function RequestsContent() {
  return (
    <Section
      title="Friend Requests"
      description="Manage incoming connection requests"
    >
      <p className="text-sm text-[#74512D]">
        No pending requests.
      </p>
    </Section>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-[#F6F1E3] px-10 py-8">
      <h1 className="text-xl font-semibold text-[#543310]">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-[#74512D]/70 mt-1 mb-6">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
