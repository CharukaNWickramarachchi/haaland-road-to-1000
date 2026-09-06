import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { GroupedGoalTotal } from '../../lib/statistics'

interface SeasonGoalsChartProps {
  data: GroupedGoalTotal[]
}

export function SeasonGoalsChart({
  data,
}: SeasonGoalsChartProps) {
  return (
    <div className="h-[330px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 15,
            right: 15,
            bottom: 10,
            left: 0,
          }}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="key"
            tick={{
              fill:
                'rgba(255,255,255,0.4)',
              fontSize: 9,
            }}
            axisLine={{
              stroke:
                'rgba(255,255,255,0.08)',
            }}
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
            width={30}
          />

          <Tooltip
            cursor={{
              fill:
                'rgba(255,255,255,0.025)',
            }}
            contentStyle={{
              background:
                '#0d1117',
              border:
                '1px solid rgba(255,255,255,0.1)',
              borderRadius: 0,
            }}
          />

          <Bar
            dataKey="goals"
            fill="#6CABDD"
            radius={0}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}