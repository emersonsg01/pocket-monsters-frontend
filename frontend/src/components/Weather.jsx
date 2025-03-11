import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';

// Ícones para condições climáticas
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Ensolarado
import CloudIcon from '@mui/icons-material/Cloud'; // Nublado
import GrainIcon from '@mui/icons-material/Grain'; // Chuva
import AcUnitIcon from '@mui/icons-material/AcUnit'; // Neve
import ThunderstormIcon from '@mui/icons-material/Thunderstorm'; // Tempestade
import WaterIcon from '@mui/icons-material/Water'; // Umidade
import AirIcon from '@mui/icons-material/Air'; // Vento
import ThermostatIcon from '@mui/icons-material/Thermostat'; // Temperatura

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  // API key do OpenWeatherMap - em produção, isso deveria estar em variáveis de ambiente
  const API_KEY = '4331a28f09f0c1b512e98b3e4e1fee0e';

  useEffect(() => {
    // Função para obter a localização do usuário
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (err) => {
            console.error('Erro ao obter localização:', err);
            setError('Não foi possível obter sua localização. Usando localização padrão.');
            // Localização padrão (São Paulo)
            setLocation({ lat: -23.5505, lon: -46.6333 });
          }
        );
      } else {
        setError('Geolocalização não é suportada pelo seu navegador. Usando localização padrão.');
        // Localização padrão (São Paulo)
        setLocation({ lat: -23.5505, lon: -46.6333 });
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    // Buscar dados do clima quando a localização estiver disponível
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric&lang=pt_br`
      );
      setWeather(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados do clima:', err);
      setError('Não foi possível carregar os dados do clima. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o ícone apropriado com base no código do clima
  const getWeatherIcon = (weatherCode) => {
    // Códigos baseados na documentação do OpenWeatherMap
    // https://openweathermap.org/weather-conditions
    if (weatherCode >= 200 && weatherCode < 300) {
      return <ThunderstormIcon fontSize="large" sx={{ color: '#FFD700' }} />; // Tempestade
    } else if (weatherCode >= 300 && weatherCode < 600) {
      return <GrainIcon fontSize="large" sx={{ color: '#1E90FF' }} />; // Chuva
    } else if (weatherCode >= 600 && weatherCode < 700) {
      return <AcUnitIcon fontSize="large" sx={{ color: '#FFFFFF' }} />; // Neve
    } else if (weatherCode >= 700 && weatherCode < 800) {
      return <CloudIcon fontSize="large" sx={{ color: '#A9A9A9' }} />; // Atmosfera (neblina, etc)
    } else if (weatherCode === 800) {
      return <WbSunnyIcon fontSize="large" sx={{ color: '#FFD700' }} />; // Céu limpo
    } else if (weatherCode > 800) {
      return <CloudIcon fontSize="large" sx={{ color: '#A9A9A9' }} />; // Nuvens
    }
    return <WbSunnyIcon fontSize="large" sx={{ color: '#FFD700' }} />; // Padrão
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getWeatherIcon(weather.weather[0].id)}
            <Typography variant="h5" sx={{ ml: 1 }}>
              {weather.name}, {weather.sys.country}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper', boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ThermostatIcon color="primary" />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  Temperatura
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {Math.round(weather.main.temp)}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sensação térmica: {Math.round(weather.main.feels_like)}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Min: {Math.round(weather.main.temp_min)}°C / Max: {Math.round(weather.main.temp_max)}°C
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <WaterIcon fontSize="small" color="info" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Umidade: {weather.main.humidity}%
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <AirIcon fontSize="small" color="info" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Vento: {Math.round(weather.wind.speed * 3.6)} km/h
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Atualizado em: {new Date(weather.dt * 1000).toLocaleTimeString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Weather;