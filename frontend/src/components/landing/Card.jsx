export default function Card({ title, description, icon }) {
  return (
    <article
      className={`bg-background-lighter/50 p-8 rounded-3xl h-60 border border-my-border shadow-[0_8px_8px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_8px_20px_rgba(243,78,78,0.2)]`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6">
        <img src={icon} alt={title} className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-secondary-dark">{description}</p>
    </article>
  );
}
