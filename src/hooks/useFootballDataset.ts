import { useEffect, useState } from 'react'

import type { FootballDataset } from '../types/football'
import { loadDataset } from '../services/loadDataset'

interface UseFootballDatasetResult {
  data: FootballDataset | null
  loading: boolean
  error: string | null
}

export function useFootballDataset(): UseFootballDatasetResult {
  const [data, setData] = useState<FootballDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function fetchDataset() {
      try {
        const dataset = await loadDataset()

        if (active) {
          setData(dataset)
          setError(null)
        }
      } catch (unknownError) {
        console.error('Failed to load football dataset:', unknownError)

        if (active) {
          setError('Goal data could not be loaded.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void fetchDataset()

    return () => {
      active = false
    }
  }, [])

  return {
    data,
    loading,
    error,
  }
}