import { AiOutlineClockCircle } from 'react-icons/ai';
import { env } from '~/env';  // Adjust this import path as needed

export default function ComingSoon() {
  const isProduction = env.NODE_ENV === 'production';

  if (!isProduction) {
    return (
      <div>
        Work in Progress
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-4">
      <div className="text-center">
        <div className="mb-8">
          <AiOutlineClockCircle size={64} className="mx-auto text-blue-500 dark:text-blue-400" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Coming Soon
        </h1>
        
        <p className="text-xl md:text-2xl mb-8">
          We are working hard to bring you something amazing. Stay tuned!
        </p>
        
        <div>
          <a 
            href="/home"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}