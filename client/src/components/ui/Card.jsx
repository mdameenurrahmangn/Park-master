export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={`
        bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl 
        shadow-soft dark:shadow-soft-dark transition-all duration-300
        ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}