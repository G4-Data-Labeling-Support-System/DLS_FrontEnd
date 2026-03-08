import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen ${themeClasses.backgrounds.deepDark} text-white overflow-hidden">
      {/* Top Right Decoration */}
      <div className="absolute top-0 right-0">
        <div className="grid grid-cols-2">
          <div className="w-16 h-16 bg-cyan-100"></div>
          <div className="w-16 h-16 bg-black"></div>
          <div className="w-16 h-16 bg-violet-400"></div>
          <div className="w-16 h-16 bg-violet-200"></div>
        </div>
      </div>

      {/* Bottom Left Decoration */}
      <div className="absolute bottom-0 left-0">
        <div className="grid grid-cols-2">
          <div className="w-16 h-16 bg-cyan-100"></div>
          <div className="w-16 h-16 bg-violet-400"></div>
          <div className="w-16 h-16 bg-black"></div>
          <div className="w-16 h-16 bg-violet-200"></div>
        </div>
      </div>

      {/* 404 Text */}
      <h1 className="text-[180px] font-bold bg-gradient-to-r from-violet-300 via-violet-500 to-cyan-200 bg-clip-text text-transparent leading-none">
        404
      </h1>

      {/* Message */}
      <p className="text-3xl mt-4 text-gray-200">Uh oh, this page doesn’t exist.</p>

      <p className="text-sm text-gray-400 mt-6">Here's a few things you can try:</p>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 border border-gray-500 rounded-full hover:bg-gray-800 transition cursor-pointer"
        >
          Go Back
        </button>

        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-white text-black rounded-full flex items-center gap-2 hover:bg-gray-200 transition cursor-pointer"
        >
          Go to Home →
        </button>
      </div>
    </div>
  )
}
