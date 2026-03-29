import HistoryCard from './HistoryCard'

function HistoryGrid({ items }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
      {items.map((item) => (
        <HistoryCard key={item.id ?? item.original_image} item={item} />
      ))}
    </div>
  )
}

export default HistoryGrid
