import {
  lazy,
  Suspense,
} from 'react'

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import { AppLayout } from './layouts/AppLayout'

const HomePage =
  lazy(
    () =>
      import(
        './pages/HomePage'
      ).then(
        (module) => ({
          default:
            module.HomePage,
        }),
      ),
  )

const GoalsPage =
  lazy(
    () =>
      import(
        './pages/GoalsPage'
      ).then(
        (module) => ({
          default:
            module.GoalsPage,
        }),
      ),
  )

const GoalDetailPage =
  lazy(
    () =>
      import(
        './pages/GoalDetailPage'
      ).then(
        (module) => ({
          default:
            module.GoalDetailPage,
        }),
      ),
  )

const CareerPage =
  lazy(
    () =>
      import(
        './pages/CareerPage'
      ).then(
        (module) => ({
          default:
            module.CareerPage,
        }),
      ),
  )

const SeasonsPage =
  lazy(
    () =>
      import(
        './pages/SeasonsPage'
      ).then(
        (module) => ({
          default:
            module.SeasonsPage,
        }),
      ),
  )

const SeasonDetailPage =
  lazy(
    () =>
      import(
        './pages/SeasonDetailPage'
      ).then(
        (module) => ({
          default:
            module.SeasonDetailPage,
        }),
      ),
  )

const CompetitionsPage =
  lazy(
    () =>
      import(
        './pages/CompetitionsPage'
      ).then(
        (module) => ({
          default:
            module.CompetitionsPage,
        }),
      ),
  )

const CompetitionDetailPage =
  lazy(
    () =>
      import(
        './pages/CompetitionDetailPage'
      ).then(
        (module) => ({
          default:
            module.CompetitionDetailPage,
        }),
      ),
  )

const ClubsPage =
  lazy(
    () =>
      import(
        './pages/ClubsPage'
      ).then(
        (module) => ({
          default:
            module.ClubsPage,
        }),
      ),
  )

const ClubDetailPage =
  lazy(
    () =>
      import(
        './pages/ClubDetailPage'
      ).then(
        (module) => ({
          default:
            module.ClubDetailPage,
        }),
      ),
  )

const AnalyticsPage =
  lazy(
    () =>
      import(
        './pages/AnalyticsPage'
      ).then(
        (module) => ({
          default:
            module.AnalyticsPage,
        }),
      ),
  )

const OpponentsPage =
  lazy(
    () =>
      import(
        './pages/OpponentsPage'
      ).then(
        (module) => ({
          default:
            module.OpponentsPage,
        }),
      ),
  )

const RecordsPage =
  lazy(
    () =>
      import(
        './pages/RecordsPage'
      ).then(
        (module) => ({
          default:
            module.RecordsPage,
        }),
      ),
  )

const ProjectionPage =
  lazy(
    () =>
      import(
        './pages/ProjectionPage'
      ).then(
        (module) => ({
          default:
            module.ProjectionPage,
        }),
      ),
  )

const SourcesPage =
  lazy(
    () =>
      import(
        './pages/SourcesPage'
      ).then(
        (module) => ({
          default:
            module.SourcesPage,
        }),
      ),
  )

const DataQualityPage =
  lazy(
    () =>
      import(
        './pages/DataQualityPage'
      ).then(
        (module) => ({
          default:
            module.DataQualityPage,
        }),
      ),
  )

const NotFoundPage =
  lazy(
    () =>
      import(
        './pages/NotFoundPage'
      ).then(
        (module) => ({
          default:
            module.NotFoundPage,
        }),
      ),
  )

  function LazyPage({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <p className="text-xs font-bold tracking-[0.18em] text-white/35 uppercase">
            Loading…
          </p>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
const router =
  createBrowserRouter([
    {
      path: '/',
      element: (
        <AppLayout />
      ),
      children: [
        {
          index: true,
          element: (
            <LazyPage>
              <HomePage />
            </LazyPage>
          ),
        },
        {
          path: 'goals',
          element: (
            <LazyPage>
              <GoalsPage />
            </LazyPage>
          ),
        },
        {
          path: 'goals/:goalNumber',
          element: (
            <LazyPage>
              <GoalDetailPage />
            </LazyPage>
          ),
        },
        {
          path: 'career',
          element: (
            <LazyPage>
              <CareerPage />
            </LazyPage>
          ),
        },
        {
          path: 'seasons',
          element: (
            <LazyPage>
              <SeasonsPage />
            </LazyPage>
          ),
        },
        {
          path: 'seasons/:seasonSlug',
          element: (
            <LazyPage>
              <SeasonDetailPage />
            </LazyPage>
          ),
        },
        {
          path: 'competitions',
          element: (
            <LazyPage>
              <CompetitionsPage />
            </LazyPage>
          ),
        },
        {
          path:
            'competitions/:competitionSlug',
          element: (
            <LazyPage>
              <CompetitionDetailPage />
            </LazyPage>
          ),
        },
        {
          path: 'clubs',
          element: (
            <LazyPage>
              <ClubsPage />
            </LazyPage>
          ),
        },
        {
          path:
            'clubs/:clubSlug',
          element: (
            <LazyPage>
              <ClubDetailPage />
            </LazyPage>
          ),
        },
        {
          path: 'analytics',
          element: (
            <LazyPage>
              <AnalyticsPage />
            </LazyPage>
          ),
        },
        {
          path: 'opponents',
          element: (
            <LazyPage>
              <OpponentsPage />
            </LazyPage>
          ),
        },
        {
          path: 'records',
          element: (
            <LazyPage>
              <RecordsPage />
            </LazyPage>
          ),
        },
        {
          path: 'projection',
          element: (
            <LazyPage>
              <ProjectionPage />
            </LazyPage>
          ),
        },
        {
          path: 'sources',
          element: (
            <LazyPage>
              <SourcesPage />
            </LazyPage>
          ),
        },
        {
          path: 'data-quality',
          element: (
            <LazyPage>
              <DataQualityPage />
            </LazyPage>
          ),
        },
        {
          path: '*',
          element: (
            <LazyPage>
              <NotFoundPage />
            </LazyPage>
          ),
        },
      ],
    },
  ])

export default function App() {
  return (
    <RouterProvider
      router={router}
    />
  )
}