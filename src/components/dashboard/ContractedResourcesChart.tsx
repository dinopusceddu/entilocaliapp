// components/dashboard/ContractedResourcesChart.tsx
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Card } from '../shared/Card.tsx';
import { TEXTS_UI } from '../../constants.ts';
import { RisorsaVariabileDetail, DistribuzioneRisorseData } from '../../types.ts';
import { getDistribuzioneFieldDefinitions } from '../../pages/FondoAccessorioDipendentePageHelpers.ts';
import { CustomChartTooltip } from './CustomChartTooltip.tsx';
import { useNormativeData } from '../../hooks/useNormativeData.ts';

// A more varied color palette for multiple slices
const COLORS = [
  '#ea2832', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#0ea5e9', '#d946ef', '#ef4444'
];

export const ContractedResourcesChart: React.FC = () => {
  const { state } = useAppContext();
  const { data: normativeData } = useNormativeData();
  const { fundData } = state;
  const { distribuzioneRisorseData } = fundData;

  const chartData = useMemo(() => {
    if (!distribuzioneRisorseData || !normativeData) return [];

    const distribuzioneFieldDefinitions = getDistribuzioneFieldDefinitions(normativeData);
    const variableUses = distribuzioneFieldDefinitions.filter(def => def.section === 'Utilizzi Parte Variabile (Art. 80 c.2)');

    return variableUses
      .map(def => {
        const stanziateValue = (distribuzioneRisorseData[def.key as keyof DistribuzioneRisorseData] as RisorsaVariabileDetail)?.stanziate || 0;
        const descriptionString = typeof def.description === 'string' ? def.description : String(def.description);
        return {
          name: descriptionString.length > 35 ? descriptionString.substring(0, 32) + '...' : descriptionString,
          value: stanziateValue,
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [distribuzioneRisorseData, normativeData]);

  const totalValue = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

  if (totalValue === 0) {
    return (
      <Card title="Distribuzione delle risorse contrattate">
        <div className="flex items-center justify-center h-64 text-[#5f5252]">
          <p>{TEXTS_UI.noDataAvailable} per il grafico. Inserire i dati nella pagina 'Distribuzione Risorse'.</p>
        </div>
      </Card>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm" style={{ textShadow: '0 0 3px black' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card title="Distribuzione delle risorse contrattate">
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
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
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              iconType="circle"
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                fontSize: '12px',
                paddingLeft: '20px',
                maxHeight: '380px',
                overflowY: 'auto'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};