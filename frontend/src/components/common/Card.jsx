function Card({ children, className = '', variant = 'default', ...props }) {
  const baseClasses = 'card-premium rounded-2xl transition-all duration-300'
  
  const variants = {
    default: 'glass-sm',
    elevated: 'glass shadow-2xl',
    subtle: 'backdrop-blur-md border',
  }

  const variantClass = variants[variant] || variants.default
  
  const elevatedStyles = variant === 'elevated' ? {
    boxShadow: '0 20px 25px rgba(99, 102, 241, 0.1)'
  } : {}
  
  return (
    <div 
      className={`${baseClasses} ${variantClass} ${className}`} 
      style={elevatedStyles}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
