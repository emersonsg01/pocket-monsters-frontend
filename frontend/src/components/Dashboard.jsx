import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress, Paper } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';
import Weather from './Weather';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMonsters: 0,
    totalTypes: 0,
    typeDistribution: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch monsters
        const monstersResponse = await axios.get('http://localhost:3000/pocket-monster');
        
        // Fetch types
        const typesResponse = await axios.get('http://localhost:3000/type');
        
        // Calculate type distribution
        const typeMap = {};
        typesResponse.data.forEach(type => {
          typeMap[type.id] = { name: type.type, count: 0 };
        });
        
        monstersResponse.data.forEach(monster => {
          if (monster.type_id && typeMap[monster.type_id]) {
            typeMap[monster.type_id].count++;
          }
        });
        
        const typeDistribution = Object.values(typeMap).filter(type => type.count > 0);
        
        setStats({
          totalMonsters: monstersResponse.data.length,
          totalTypes: typesResponse.data.length,
          typeDistribution
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set some default data for development
        setStats({
          totalMonsters: 0,
          totalTypes: 0,
          typeDistribution: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const StatCard = ({ title, value, icon }) => (
    <Card className="card fade-in" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(45deg, rgba(30,30,30,0.8) 30%, rgba(45,45,45,0.8) 90%)',
            borderRadius: 2
          }}
          className="fade-in"
        >
          <Typography variant="h4" gutterBottom>
            Welcome to Pocket Monsters Management System
          </Typography>
          <Typography variant="body1">
            Manage your pocket monsters collection with ease. View statistics, add new monsters, and organize them by types.
          </Typography>
        </Paper>
      </Grid>

      {loading ? (
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Total Monsters" 
              value={stats.totalMonsters} 
              icon={<Box component="img" src="/monster-icon.svg" alt="Monster" sx={{ width: 24, height: 24 }} />}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Total Types" 
              value={stats.totalTypes} 
              icon={<Box component="img" src="/type-icon.svg" alt="Type" sx={{ width: 24, height: 24 }} />}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className="card fade-in" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Latest Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No recent activities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card className="card fade-in" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Type Distribution
                </Typography>
                {stats.typeDistribution.length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.typeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} monsters`, props.payload.name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No type distribution data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card className="card fade-in" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weather Information
                </Typography>
                <Weather />
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default Dashboard;