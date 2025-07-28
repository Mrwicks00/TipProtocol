// components/dashboard/ActivityChart.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Jan", tips: 400, received: 240 },
  { name: "Feb", tips: 300, received: 139 },
  { name: "Mar", tips: 200, received: 980 },
  { name: "Apr", tips: 278, received: 390 },
  { name: "May", tips: 189, received: 480 },
  { name: "Jun", tips: 239, received: 380 },
];

export function ActivityChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Tipping Activity (Mock Data)</CardTitle>
        <CardDescription>Your tips sent and received over time (Requires a subgraph for real data)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="tips" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="received" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}