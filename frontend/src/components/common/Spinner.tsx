export default function Spinner({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`${className} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`} />
  )
}
