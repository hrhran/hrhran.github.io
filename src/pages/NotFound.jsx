import { Link } from 'react-router-dom'
import { FaExclamationTriangle, FaHome } from 'react-icons/fa'

export default function NotFound() {
  return (
    <div className="min-h-screen w-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center px-4">
      <div className="text-center w-full">
        <FaExclamationTriangle size={80} className="mx-auto mb-8 text-red-500 animate-pulse" />
        
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-3xl mb-4 text-blue-300">Page Not Found</h2>
          <div className="bg-gray-900 p-6 rounded-lg border border-green-400 text-left">
            <p className="mb-2">
              <span className="text-red-400">Error:</span> The requested resource could not be found
            </p>
            <p className="mb-2">
              <span className="text-yellow-400">Path:</span> {window.location.pathname}
            </p>
            <p className="mb-2">
              <span className="text-blue-400">Status:</span> 404 NOT_FOUND
            </p>
            <p className="mt-4 text-green-200">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 bg-green-400 text-black px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-bold"
        >
          <FaHome size={20} />
          <span>Return to Home</span>
        </Link>

        <div className="mt-8 text-sm text-green-600">
          <p>~ hrhran@portfolio:/{window.location.pathname.slice(1)} $</p>
        </div>
      </div>
    </div>
  )
}

