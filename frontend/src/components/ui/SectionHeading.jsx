export default function SectionHeading({ children, subtitle }) {
  return (
    <>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-center">{children}</h2>
      {subtitle && <h3 className="text-secondary-dark text-lg max-w-4xl mx-auto text-center leading-8">{subtitle}</h3>}
    </>
  );
}
