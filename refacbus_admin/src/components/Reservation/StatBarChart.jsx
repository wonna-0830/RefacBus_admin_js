import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const StatBarChart = ({
  data = [],
  dataKey = 'count',
  color = '#FABE00',
  barSize = 50,
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} barSize={barSize} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StatBarChart;
