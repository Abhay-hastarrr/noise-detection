function PageHeader({ title, subtitle, align = 'center' }) {
  const alignment = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'

  return (
    <div className={`space-y-2 ${alignment}`}>
      <h1 className="text-4xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-gray-400">{subtitle}</p>}
    </div>
  )
}

export default PageHeader
