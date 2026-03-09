export const WS_CONNECTION_URL = 'wss://games-online-service.onrender.com';
export const base_url = 'https://games-online-service.onrender.com';

// export const WS_CONNECTION_URL = 'ws://localhost:3000';
// export const base_url = 'http://localhost:3000'

export const apiRoutes = {
    login: '/login',
    register: '/registe',
    getMe: '/me',
    battleship: WS_CONNECTION_URL+'/ws/battleship',
    chess: WS_CONNECTION_URL+'/ws/chess'
}