const Panel = ({ title, children, className = '', headerRight }) => {
  return (
    <div className={`border border-primary-dark rounded-xl sm:rounded-2xl p-5 lg:p-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-outfit font-medium text-lg lg:text-xl text-primary-dark">{title}</h3>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Panel
