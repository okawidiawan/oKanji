export default function SectionHeading({ children, subtitle }) {
  return (
    <>
      <h2 className="text-xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-center">{children}</h2>
      {subtitle && <h3 className="text-secondary-dark sm:text-lg text-xs max-w-4xl mx-auto text-center sm:leading-8 line-clamp-4 sm:line-clamp-none w-sm sm:w-full px-4 sm:px-0">{subtitle}</h3>}
    </>
  );
}
