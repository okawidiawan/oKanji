/**
 * Komponen Feature
 * Menampilkan baris fitur produk yang berisi judul, penjelasan, dan gambar.
 * Pada layar desktop (md ke atas), gambar menggunakan efek rotasi 3D dan tingkat transparansi 50% (naik ke 100% jika diarahkan kursor).
 * Pada layar mobile, gambar akan tampil datar tanpa rotasi 3D dan dengan kejelasan penuh (opacity 100%).
 *
 * @param {string} title - Judul fitur
 * @param {string} description - Penjelasan dari fitur
 * @param {string} image - Path asset gambar fitur
 * @param {boolean} isReversed - Menentukan apakah posisi gambar dan teks ditukar (hanya berlaku pada layar md ke atas)
 */
export default function Feature({ title, description, image, isReversed }) {
  return (
    <article className={`flex flex-col md:flex-row items-center gap-12 py-16 px-4 sm:px-12 ${isReversed ? "md:flex-row-reverse" : ""}`}>
      <div className="w-full md:w-1/2">
        <h3 className={`sm:text-3xl text-lg font-bold mb-4 ${isReversed ? "text-center md:text-right" : "text-center md:text-left"}`}>{title}</h3>
        <p className={`sm:text-lg text-sm text-secondary-dark leading-relaxed ${isReversed ? "text-center md:text-right" : "text-center md:text-left"}`}>{description}</p>
      </div>

      <div className="w-full md:w-1/2">
        <img
          src={image}
          alt={title}
          className={`rounded-2xl p-2 w-full h-auto border border-my-border shadow-2xl transition-all duration-700 hover:shadow-primary/20 opacity-100 md:opacity-50 md:hover:opacity-100
  ${
    isReversed
      ? "md:transform-[perspective(1000px)_rotateY(15deg)_rotateX(5deg)] md:hover:transform-[perspective(1000px)_rotateY(0deg)_rotateX(0deg)]"
      : "md:transform-[perspective(1000px)_rotateY(-15deg)_rotateX(5deg)] md:hover:transform-[perspective(1000px)_rotateY(0deg)_rotateX(0deg)]"
  }`}
        />
      </div>
    </article>
  );
}
