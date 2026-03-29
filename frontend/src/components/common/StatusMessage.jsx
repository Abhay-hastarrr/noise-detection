const variantStyles = {
  info: 'text-gray-400',
  success: 'text-emerald-400',
  error: 'text-red-400',
  empty: 'text-gray-500',
}

function StatusMessage({ message, variant = 'info' }) {
  return <p className={`text-center ${variantStyles[variant] ?? variantStyles.info}`}>{message}</p>
}

export default StatusMessage
