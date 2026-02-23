// components/dashboard/FundAllocationChart.tsx
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../shared/Card';
import { TEXTS_UI } from '../../constants';
import { CustomChartTooltip } from './CustomChartTooltip';

export const FundAllocationChart: React.FC = () => {
  const { state } = useAppContext();
  const { calculatedFund } = state;

  const data = useMemo(() => {
    if (!calculatedFund) return [];
    return [
      { name: 'Parte Stabile', value: calculatedFund.totaleComponenteStabile || 0 },
      { name: 'Parte Variabile', value: calculatedFund.totaleComponenteVariabile || 0 },
    ].filter(d => d.value > 0);
  }, [calculatedFund]);

  if (!calculatedFund || data.length === 0) {
    return (
      <Card title="Ripartizione del Fondo">
        <div className="flex items-center justify-center h-64 text-[#5f5252]">
          <p>{TEXTS_UI.noDataAvailable} per il grafico.</p>
        </div>
      </Card>
    );
  }

  // Using theme colors: a light contrasting color and the primary red
  const COLORS = ['#d1c0c1', '#ea2832'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Avoid clutter for small slices

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-shadow text-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };


  return (
    <Card title="Ripartizione del Fondo">
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={110}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              stroke="#fcf8f8"
              strokeWidth={3}
              isAnimationActive={true}
              animationDuration={800}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomChartTooltip />} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};