import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  clickable = false,
  onClick,
  ...props
}) => {
  const baseClasses = `
    bg-white dark:bg-gray-800 
    rounded-xl shadow-sm border border-gray-200 dark:border-gray-700
    transition-all duration-300 ease-in-out
    ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
    ${clickable ? 'cursor-pointer hover:scale-[1.02]' : ''}
    ${className}
  `;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" } : {}}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;