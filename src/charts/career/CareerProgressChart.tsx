import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { CumulativeGoalPoint } from '../../lib/statistics'

interface CareerProgressChartProps {
  data: CumulativeGoalPoint[]
}

export function CareerProgressChart({
  data,
}: CareerProgressChartProps) {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 15,
            right: 15,
            bottom: 5,
            left: 0,
          }}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{
              fill:
                'rgba(255,255,255,0.35)',
              fontSize: 10,
            }}
            axisLine={{
              stroke:
                'rgba(255,255,255,0.08)',
            }}
            tickLine={false}
            minTickGap={70}
          />

          <YAxis
            domain={[0, 1000]}
            ticks={[
              0,
              200,
              400,
              600,
              800,
              1000,
            ]}
            tick={{
              fill:
                'rgba(255,255,255,0.35)',
              fontSize: 10,
            }}
            axisLine={false}
            tickLine={false}
            width={40}
          />

          <Tooltip
            contentStyle={{
              background:
                '#0d1117',
              border:
                '1px solid rgba(255,255,255,0.1)',
              borderRadius: 0,
            }}
            labelStyle={{
              color:
                'rgba(255,255,255,0.45)',
            }}
            formatter={(
              value,
            ) => [
              `Goal #${value}`,
              'Career total',
            ]}
          />

          <Line
            type="monotone"
            dataKey="goalNumber"
            stroke="#6CABDD"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#6CABDD',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}