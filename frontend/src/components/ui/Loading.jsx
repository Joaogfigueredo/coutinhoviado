import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-block ${sizes[size]} ${className}`}
    >
      <svg
        className="animate-spin text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

const Skeleton = ({ className = '', lines = 1, animate = true }) => {
  const skeletonVariants = {
    loading: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          variants={animate ? skeletonVariants : {}}
          animate={animate ? "loading" : ""}
          className={`
            bg-gray-200 dark:bg-gray-700 rounded-md h-4
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
            ${className}
          `}
        />
      ))}
    </div>
  );
};

const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${className}`}>
    <div className="space-y-4">
      <Skeleton className="h-6" />
      <Skeleton lines={3} />
      <div className="flex justify-between">
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-16 h-8" />
      </div>
    </div>
  </div>
);

export { LoadingSpinner, Skeleton, CardSkeleton };