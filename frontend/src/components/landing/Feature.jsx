export default function Feature({ title, description, image, isReversed }) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-12 py-16 ${isReversed ? "md:flex-row-reverse" : ""}`}>
      <div className="w-full md:w-1/2">
        <h3 className={`text-3xl font-bold mb-4  ${isReversed ? "text-right" : ""}`}>{title}</h3>
        <p className={`text-lg text-secondary-dark leading-relaxed ${isReversed ? "text-right" : ""}`}>{description}</p>
      </div>

      <div className="w-full md:w-1/2">
        <img
          src={image}
          alt={title}
          className={`rounded-2xl w-full h-auto border border-my-border shadow-2xl transition-all duration-700 hover:shadow-primary/20 opacity-50 hover:opacity-100 
  ${
    isReversed
      ? "[transform:perspective(1000px)_rotateY(15deg)_rotateX(5deg)] hover:[transform:perspective(1000px)_rotateY(0deg)_rotateX(0deg)]"
      : "[transform:perspective(1000px)_rotateY(-15deg)_rotateX(5deg)] hover:[transform:perspective(1000px)_rotateY(0deg)_rotateX(0deg)]"
  }`}
        />
      </div>
    </div>
  );
}
