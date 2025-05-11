interface StatCardProps {
  title: string
  value: string
  change: string
  positive: boolean
}

export function StatCard({ title, value, change, positive }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-8">{title}</h3>
      <div className="flex flex-col items-center justify-center">
        <p className="text-5xl font-bold mb-6">{value}</p>
        <div className="bg-[#8CD790] bg-opacity-20 text-[#8CD790] px-4 py-2 rounded-full text-sm">{change}</div>
      </div>
    </div>
  )
}

