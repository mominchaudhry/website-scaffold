interface UnknownSectionProps {
  componentUid: string;
}

export function UnknownSection({ componentUid }: UnknownSectionProps) {
  return (
    <section className="section unknown-section">
      <div className="shell">
        <p>Unsupported section type: {componentUid}</p>
      </div>
    </section>
  );
}
