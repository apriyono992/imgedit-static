import { useState } from 'react'

interface TableStateOptions {
  defaultSortBy?: string
  defaultSortOrder?: 'ASC' | 'DESC'
}

export function useTableState(opts: TableStateOptions = {}) {
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState(opts.defaultSortBy ?? 'createdAt')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(opts.defaultSortOrder ?? 'DESC')
  const [search, setSearch] = useState('')

  function handleSort(key: string) {
    if (key === sortBy) {
      setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(key)
      setSortOrder('DESC')
    }
    setPage(1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return { page, setPage, sortBy, sortOrder, search, handleSearch, handleSort }
}
