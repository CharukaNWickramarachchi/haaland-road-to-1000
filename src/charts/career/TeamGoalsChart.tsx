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

interface TeamGoalsChartProps {
  data: GroupedGoalTotal[]
}

export function TeamGoalsChart({
  data,
}: TeamGoalsChartProps) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 20,
            left: 15,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.06)"
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{
              fill:
                'rgba(255,255,255,0.35)',
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            dataKey="key"
            type="category"
            width={125}
            tick={{
              fill:
                'rgba(255,255,255,0.5)',
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
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