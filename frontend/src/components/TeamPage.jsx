"use client"

import { useEffect, useState, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchAnalytics } from "../lib/features/analyticsSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Progress } from "./ui/progress"
import { Separator } from "./ui/separator"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Users, Award, TrendingUp, CheckCircle, FileText, Mail, Phone, MapPin, Search, Filter, Star, Calendar, Briefcase, GraduationCap, GitBranch, Target, BarChart3, PieChart, LineChart, Activity, DollarSign } from "lucide-react"
import {
  PieChart as RechartPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as RechartLineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts"

// Chart colors and helper functions
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

// Custom tooltips for charts
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
            <p className="text-sm text-gray-600">
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }} />
          <p className="text-sm text-gray-600">
            Value: <span className="font-medium">${data.value.toLocaleString()}</span>
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {((data.value / payload.reduce((sum, entry) => sum + entry.value, 0)) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{payload[0].payload.subject}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8884d8' }} />
          <p className="text-sm text-gray-600">
            Score: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <div className="space-y-1 mt-1">
          <p className="text-sm text-gray-600">
            Proposals: <span className="font-medium">{data.proposals}</span>
          </p>
          <p className="text-sm text-gray-600">
            Win Rate: <span className="font-medium">{data.winRate}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-medium">${data.value.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function TeamPage() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector((state) => state.analytics)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [showAvailabilityStatus, setShowAvailabilityStatus] = useState(true)
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true)

  useEffect(() => {
    if (!data) {
      dispatch(fetchAnalytics())
    }
  }, [dispatch, data])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    )
  }

  // Extended team data with additional information
  const teamData = [
    {
      ...data.teamPerformance[0],
      role: "Senior Proposal Manager",
      email: "anil.kumawat@company.com",
      phone: "+91 98765 43210",
      location: "Bangalore, India",
      expertise: ["Enterprise Software", "CRM Solutions", "Digital Transformation"],
      education: "MBA, Business Administration",
      languages: ["English", "Hindi"],
      availability: "Available",
      availabilityStatus: "available",
      currentProject: "Enterprise CRM Implementation",
      joinDate: "2020-05-15",
      certifications: ["PMP", "ITIL Foundation"],
      avatar: "/avatars/anil.jpg"
    },
    {
      ...data.teamPerformance[1],
      role: "Technical Lead",
      email: "manjunatha.a@company.com",
      phone: "+91 87654 32109",
      location: "Pune, India",
      expertise: ["Cloud Migration", "Infrastructure", "DevOps"],
      education: "MS, Computer Science",
      languages: ["English", "Kannada"],
      availability: "On Project",
      availabilityStatus: "busy",
      currentProject: "Cloud Migration",
      joinDate: "2019-08-10",
      certifications: ["AWS Solutions Architect", "Azure Administrator"],
      avatar: "/avatars/manjunatha.jpg"
    },
    {
      ...data.teamPerformance[2],
      role: "Business Analyst",
      email: "rukesh.s@company.com",
      phone: "+91 76543 21098",
      location: "Chennai, India",
      expertise: ["Data Analytics", "Business Intelligence", "Process Optimization"],
      education: "BS, Business Analytics",
      languages: ["English", "Tamil"],
      availability: "Available",
      availabilityStatus: "available",
      currentProject: "Process Optimization",
      joinDate: "2021-02-20",
      certifications: ["CBAP", "Six Sigma Green Belt"],
      avatar: "/avatars/rukesh.jpg"
    },
    {
      ...data.teamPerformance[3],
      role: "AI/ML Engineer",
      email: "bharath.jpv@company.com",
      phone: "+91 65432 10987",
      location: "Hyderabad, India",
      expertise: ["Machine Learning", "Deep Learning", "Computer Vision", "NLP"],
      education: "PhD, Artificial Intelligence",
      languages: ["English", "Telugu"],
      availability: "On Leave",
      availabilityStatus: "away",
      currentProject: "Predictive Analytics Platform",
      joinDate: "2022-01-05",
      certifications: ["TensorFlow Developer", "Google Cloud ML Engineer"],
      avatar: "/avatars/bharath.jpg"
    },
    {
      name: "Priya Sharma",
      role: "Project Manager",
      email: "priya.sharma@company.com",
      phone: "+91 54321 09876",
      location: "Mumbai, India",
      expertise: ["Agile Methodologies", "Risk Management", "Stakeholder Communication"],
      education: "MBA, Project Management",
      languages: ["English", "Hindi", "Punjabi"],
      availability: "Available",
      availabilityStatus: "available",
      currentProject: "Healthcare Portal",
      joinDate: "2021-06-15",
      certifications: ["PMP", "Scrum Master"],
      proposals: 9,
      approved: 7,
      value: 680000,
      winRate: 78,
      avatar: "/avatars/priya.jpg"
    },
    {
      name: "David Chen",
      role: "Security Specialist",
      email: "david.chen@company.com",
      phone: "+91 43210 98765",
      location: "Gurgaon, India",
      expertise: ["Cybersecurity", "Penetration Testing", "Security Architecture"],
      education: "MS, Information Security",
      languages: ["English", "Mandarin"],
      availability: "On Project",
      availabilityStatus: "busy",
      currentProject: "Security Compliance Audit",
      joinDate: "2020-11-10",
      certifications: ["CISSP", "CEH", "CompTIA Security+"],
      proposals: 7,
      approved: 5,
      value: 520000,
      winRate: 71,
      avatar: "/avatars/david.jpg"
    }
  ]
  
  // Apply filters and sorting
  const filteredTeamData = teamData
    .filter(member => {
      // Search filter
      const searchMatch = searchTerm === "" || 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Role filter
      const roleMatch = roleFilter === "all" || member.role === roleFilter
      
      return searchMatch && roleMatch
    })
    .sort((a, b) => {
      switch(sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "role":
          return a.role.localeCompare(b.role)
        case "winRate":
          return b.winRate - a.winRate
        case "value":
          return b.value - a.value
        default:
          return 0
      }
    })
    
  // Get unique roles for filter dropdown
  const uniqueRoles = ["all", ...new Set(teamData.map(member => member.role))]
  
  // Function to generate skills data for radar chart
  const getSkillsData = () => {
    // Extract all unique skills from team members
    const allSkills = teamData.flatMap(member => member.expertise || []);
    const uniqueSkills = [...new Set(allSkills)];
    
    // Select top 6 skills (or fewer if there aren't 6)
    const topSkills = uniqueSkills.slice(0, 6);
    
    // Calculate percentage of team members with each skill
    return topSkills.map(skill => {
      const membersWithSkill = teamData.filter(member => 
        (member.expertise || []).includes(skill)
      ).length;
      
      const percentage = (membersWithSkill / teamData.length) * 100;
      
      return {
        subject: skill,
        A: percentage,
        fullMark: 100
      };
    });
  };

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
          <p className="text-muted-foreground">Manage and view your proposal team's performance and details.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-sm bg-blue-50">
            <Users className="h-4 w-4 mr-1" />
            {teamData.length} Members
          </Badge>
        </div>
      </div>
      
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Role Filter */}
            <div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role === "all" ? "All Roles" : role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort By */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="winRate">Win Rate</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Display Options */}
            <div className="flex gap-2">
              <Button 
                variant={showAvailabilityStatus ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowAvailabilityStatus(!showAvailabilityStatus)}
                className="text-xs"
              >
                <Target className="h-4 w-4 mr-1" />
                Availability
              </Button>
              <Button 
                variant={showPerformanceMetrics ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                className="text-xs"
              >
                <Star className="h-4 w-4 mr-1" />
                Performance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Overview */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Proposals</CardTitle>
            <div className="p-2 bg-blue-200 rounded-full">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {teamData.reduce((sum, member) => sum + member.proposals, 0)}
            </div>
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
            <CardTitle className="text-sm font-medium text-green-700">Approved Proposals</CardTitle>
            <div className="p-2 bg-green-200 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {teamData.reduce((sum, member) => sum + member.approved, 0)}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
            <div className="mt-2">
              <Progress value={65} className="h-1" />
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
            <div className="text-3xl font-bold text-purple-900">
              ${(teamData.reduce((sum, member) => sum + member.value, 0) / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% from last month
            </div>
            <div className="mt-2">
              <Progress value={85} className="h-1" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Avg. Win Rate</CardTitle>
            <div className="p-2 bg-amber-200 rounded-full">
              <Target className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">
              {Math.round(teamData.reduce((sum, member) => sum + member.winRate, 0) / teamData.length)}%
            </div>
            <div className="flex items-center text-xs text-amber-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last month
            </div>
            <div className="mt-2">
              <Progress value={70} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div> */}
      
      {/* Interactive Charts */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Team Performance Analytics
          </CardTitle>
          <CardDescription>Interactive visualizations of team metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Trends
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-4">
              <div style={{ width: "100%", height: "400px" }}>
                <ResponsiveContainer>
                  <BarChart data={teamData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend />
                    <Bar name="Proposals" dataKey="proposals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar name="Approved" dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <div style={{ width: "100%", height: "400px" }}>
                <ResponsiveContainer>
                  <RechartPieChart>
                    <Pie
                      data={teamData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {teamData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </RechartPieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-4">
              <div style={{ width: "100%", height: "400px" }}>
                <ResponsiveContainer>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getSkillsData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Team Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip content={<CustomRadarTooltip />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <div style={{ width: "100%", height: "400px" }}>
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="proposals" name="Proposals" unit="" />
                    <YAxis type="number" dataKey="winRate" name="Win Rate" unit="%" />
                    <ZAxis type="number" dataKey="value" name="Value" unit="$" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                    <Legend />
                    <Scatter name="Team Members" data={teamData} fill="#8884d8">
                      {teamData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTeamData.map((member) => (
          <Card key={member.name} className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24 relative">
              <div className="absolute -bottom-12 left-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-2xl">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-16 pb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                  {showAvailabilityStatus && (
                    <Badge 
                      className={`mt-1 ${member.availabilityStatus === 'available' ? 'bg-green-500' : 
                                          member.availabilityStatus === 'busy' ? 'bg-amber-500' : 
                                          'bg-red-500'}`}
                    >
                      {member.availability}
                    </Badge>
                  )}
                </div>
                {showPerformanceMetrics && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                    {member.winRate}% Win Rate
                  </Badge>
                )}
              </div>
              
              {showPerformanceMetrics && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.proposals} Proposals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.approved} Approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">${(member.value / 1000).toFixed(0)}K Value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Top Performer</span>
                  </div>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.currentProject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.education}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {member.certifications.map((cert) => (
                    <Badge key={cert} variant="outline" className="border-blue-200 bg-blue-50">{cert}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {member.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="border-purple-200 bg-purple-50">{lang}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}