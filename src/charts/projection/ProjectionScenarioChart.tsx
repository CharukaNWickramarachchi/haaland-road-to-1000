import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ProjectionScenario } from '../../lib/projection/projectionEngine'

export function ProjectionScenarioChart({
  scenarios,
}: {
  scenarios: ProjectionScenario[]
}) {
  const data =
    scenarios.map(
      (scenario) => ({
        name:
          scenario.name,
        goalsPerYear:
          Number(
            scenario.goalsPerYear.toFixed(
              1,
            ),
          ),
      }),
    )

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            bottom: 10,
            left: 0,
          }}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fill:
                'rgba(255,255,255,0.4)',
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill:
                'rgba(255,255,255,0.35)',
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
            width={35}
          />

          <Tooltip
            contentStyle={{
              background:
                '#0d1117',
              border:
                '1px solid rgba(255,255,255,0.1)',
              borderRadius: 0,
            }}
          />

          <Bar
            dataKey="goalsPerYear"
            fill="#6CABDD"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}