"use client";
import React from "react";
import Chart, {Props} from "react-apexcharts";
import Box from "../box";
export const SalesChart=({
  ordersData,
}: {
  ordersData?: {
    month: string;
    count: number;
  }[];
}) => {
  const chartSeries: Props["series"] = [
    {
      name: "Sales",
      data: ordersData?.map((data) => data.count)||[
        31, 40, 28, 51, 42, 109, 100
      ],
    },
  ];

  const chartOptions: Props["options"] = {
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      categories: ordersData?.map((data) => data.month)||[
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"
      ],
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
  };

  return (
    <Box className="mt-6">
      <Chart options={chartOptions} series={chartSeries} type="area" height={350} />
    </Box>
  );
};
