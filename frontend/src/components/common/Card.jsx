function Card({ children, className = '', variant = 'default', ...props }) {
  const baseClasses = 'card-premium'
  
  const variants = {
    default: 'glass-sm',
    elevated: 'glass shadow-2xl shadow-purple-500/10',
    subtle: 'bg-white/3 backdrop-blur-md border border-white/5',
  }

  const variantClass = variants[variant] || variants.default
  
  return (
    <div className={`${baseClasses} ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card
