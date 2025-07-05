"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchAnalytics } from "@/lib/features/analyticsSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  Tooltip,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Clock, Target, Award, Activity } from "lucide-react"

export default function AnalyticsDashboard() {
  const dispatch = useDispatch()
  const { data: analytics, loading } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchAnalytics())
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="ml-3 text-lg">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) return null

  const totalProposals = analytics.proposalsByStatus.reduce((sum, item) => sum + item.value, 0)
  const approvedProposals = analytics.proposalsByStatus.find((item) => item.name === "Approved")?.value || 0
  const winRate = Math.round((approvedProposals / totalProposals) * 100)

  // Enhanced data for bar chart
  const priorityData = analytics.proposalsByPriority.map((item) => ({
    ...item,
    percentage: ((item.value / analytics.proposalsByPriority.reduce((sum, p) => sum + p.value, 0)) * 100).toFixed(1),
  }))

  // Custom tooltip components
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: data.payload.color }} />
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-xs text-gray-500">{((data.value / totalProposals) * 100).toFixed(1)}% of total</p>
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label} Priority</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CustomAreaTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-medium text-gray-800 ml-2">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-lg font-bold text-green-600">${value.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Monthly proposal value</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Proposals</CardTitle>
            <div className="p-2 bg-blue-200 rounded-full">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{totalProposals}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
            <div className="mt-2">
              <Progress value={75} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Win Rate</CardTitle>
            <div className="p-2 bg-green-200 rounded-full">
              <Target className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{winRate}%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last month
            </div>
            <div className="mt-2">
              <Progress value={winRate} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Value</CardTitle>
            <div className="p-2 bg-purple-200 rounded-full">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">$2.1M</div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18% from last month
            </div>
            <div className="mt-2">
              <Progress value={85} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Avg. Deal Size</CardTitle>
            <div className="p-2 bg-orange-200 rounded-full">
              <Award className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">$87K</div>
            <div className="flex items-center text-xs text-orange-600 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3% from last month
            </div>
            <div className="mt-2">
              <Progress value={60} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 - Fixed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart - Proposals by Status - FIXED */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Proposals by Status
            </CardTitle>
            <CardDescription>Distribution of proposal statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: "400px" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analytics.proposalsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.proposalsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {analytics.proposalsByStatus.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium flex-1">{item.name}</span>
                  <Badge variant="secondary">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Priority Distribution - FIXED */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
            <CardDescription>Proposals by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: "400px" }}>
              <ResponsiveContainer>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area Chart - Monthly Trends */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Proposal creation and approval trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: "400px" }}>
            <ResponsiveContainer>
              <AreaChart data={analytics.monthlyProposals}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomAreaTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="created"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#colorCreated)"
                  name="Created"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#colorApproved)"
                  name="Approved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Line Chart - Value Trends */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Proposal Value Trends
          </CardTitle>
          <CardDescription>Monthly proposal values and growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: "350px" }}>
            <ResponsiveContainer>
              <LineChart data={analytics.monthlyProposals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: "#8b5cf6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Performance */}
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Performance
            </CardTitle>
            <CardDescription>Individual team member statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analytics.teamPerformance.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="ring-2 ring-blue-200">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.proposals} proposals • ${member.value.toLocaleString()} value
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{member.winRate}% win rate</span>
                      <Badge
                        variant={member.winRate >= 70 ? "default" : "secondary"}
                        className={member.winRate >= 70 ? "bg-green-600" : ""}
                      >
                        {member.approved}/{member.proposals}
                      </Badge>
                    </div>
                    <Progress value={member.winRate} className="w-24 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest proposal activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-2 shadow-sm ${
                      activity.type === "approved"
                        ? "bg-green-500"
                        : activity.type === "created"
                          ? "bg-blue-500"
                          : activity.type === "commented"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.type} "{activity.proposal}"
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
