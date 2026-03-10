export const BrandLogo = () => {
  return (
    <div>
      {/* Icon: Violet with shadow */}
      <a href="/" className="h-auto w-auto flex flex-row gap-3 items-center">
        <img
          src="/black-hole.png"
          alt="logo"
          width={35}
          height={35}
          className="cursor-pointer hover:animate-slowspin"
        />

        {/* Text: Data Labeling System */}
        <span className={`text-white font-bold text-2xl font-inter`}>
          Data Labeling{' '}
          <span className="font-semibold bg-linear-to-r from-violet-300 via-violet-500 to-cyan-200 bg-clip-text text-transparent leading-none">
            System
          </span>
        </span>
      </a>
    </div>
  )
}
