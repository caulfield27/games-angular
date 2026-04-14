// export const WS_CONNECTION_URL = 'wss://games-backend-lp7l.onrender.com';
// export const base_url = 'https://games-backend-lp7l.onrender.com';

export const WS_CONNECTION_URL = 'wss://games-backend-production-c73f.up.railway.app';
export const base_url = 'https://games-backend-production-c73f.up.railway.app'

export const apiRoutes = {
    login: '/api/login',
    register: '/api/register',
    getMe: '/api/me',
    battleship: WS_CONNECTION_URL+'/ws/battleship',
    chess: WS_CONNECTION_URL+'/ws/chess'
}