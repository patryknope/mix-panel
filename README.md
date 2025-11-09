# Get5 Panel for CS2 with MatchZy

A modern web panel for managing CS2 (Counter-Strike 2) matches using MatchZy plugin. Built with Next.js 14, Prisma, and MySQL, optimized for Vercel deployment.

## Features

- 🎮 **Match Management**: Create and manage CS2 matches with BO1/BO3/BO5 support
- 👥 **Team Management**: Create teams and manage players
- 🖥️ **Server Management**: Add and manage multiple CS2 servers
- 🔐 **Steam Authentication**: Secure login via Steam
- 📊 **Live Match Stats**: Real-time match updates via MatchZy webhooks
- 🎯 **Veto System**: Map veto support for competitive matches
- 📈 **Player Statistics**: Track player performance across matches
- 🚀 **Vercel Ready**: Optimized for serverless deployment

## Prerequisites

- Node.js 18+ 
- MySQL database (you already have this from your hosting)
- Steam API Key (get from https://steamcommunity.com/dev/apikey)
- CS2 Server with MatchZy plugin installed
- Vercel account for deployment

## Quick Setup

### 1. Clone and Install

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

```env
# Your MySQL Database from hosting (based on your screenshot)
DATABASE_URL="mysql://929981:YOUR_PASSWORD_HERE@sql.pukawka.pl:3306/929981"

# NextAuth Configuration
NEXTAUTH_URL="https://your-app.vercel.app" # Your Vercel URL
NEXTAUTH_SECRET="generate-random-32-chars-here" # Generate with: openssl rand -base64 32

# Steam API Configuration
STEAM_API_KEY="your-steam-api-key-here"
STEAM_CALLBACK_URL="https://your-app.vercel.app/api/auth/callback/steam"

# MatchZy API Key (generate a secure one)
MATCHZY_API_KEY="generate-secure-api-key-here"
```

### 3. Setup Database

```bash
# Push the database schema
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 4. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (same as `.env.local`)
5. Deploy!

### 3. Configure Production Database

In Vercel project settings, add all environment variables:

- `DATABASE_URL`: Your MySQL connection string
- `NEXTAUTH_URL`: Your production URL (https://your-app.vercel.app)
- `NEXTAUTH_SECRET`: Keep the same secret for production
- `STEAM_API_KEY`: Your Steam API key
- `STEAM_CALLBACK_URL`: Update with production URL

## CS2 Server Configuration

### 1. Install MatchZy on your CS2 Server

Follow the [MatchZy installation guide](https://github.com/shobhit-pathak/MatchZy#installation)

### 2. Configure MatchZy to use your panel

In your CS2 server, set these CVARs:

```
// In your server.cfg or matchzy config
get5_web_api_url "https://your-app.vercel.app/api"
```

### 3. Add Server in Panel

1. Login to your panel with Steam
2. Go to Servers → Add Server
3. Enter your server details:
   - Name: Your server name
   - IP: Your server IP
   - Port: Your server port (usually 27015)
   - RCON Password: Your RCON password

## Usage

### Creating a Match

1. **Create Teams**: Go to Teams → Create Team
   - Add team name and tag
   - Add players by Steam ID

2. **Add Server**: Go to Servers → Add Server
   - Enter server connection details

3. **Create Match**: Go to Matches → Create Match
   - Select both teams
   - Choose server
   - Configure match settings (BO1/BO3/BO5, map pool, etc.)

4. **Start Match**: 
   - The panel will automatically configure the server
   - Players join the server
   - Match starts automatically when all players are ready

### Match Flow

1. Panel sends match configuration to CS2 server
2. Players join and type `!ready`
3. Veto phase (if enabled)
4. Knife round for side selection
5. Match begins
6. Live stats are sent back to panel via webhooks

## API Endpoints

### Public Endpoints

- `GET /api/match/{matchId}/config` - Get match configuration (for MatchZy)

### Webhook Endpoints (from MatchZy)

- `POST /api/match/{matchId}/webhook` - Receive match events

### Event Types Handled

- `series_start` - Match series started
- `map_start` - Map started
- `round_end` - Round ended
- `map_end` - Map finished
- `series_end` - Match series finished
- `player_stats` - Player statistics update

## Database Schema

The application uses the following main tables:

- **User**: Steam users
- **Team**: Registered teams
- **TeamPlayer**: Team rosters
- **Server**: CS2 game servers
- **Match**: Match configurations and results
- **MapStat**: Per-map statistics
- **PlayerStat**: Player performance statistics

## Troubleshooting

### Database Connection Issues

Make sure your MySQL database allows connections from Vercel's IP addresses. You might need to whitelist Vercel IPs in your hosting panel.

### Steam Login Not Working

1. Verify your Steam API key is correct
2. Check STEAM_CALLBACK_URL matches your domain
3. Ensure NEXTAUTH_URL is set correctly

### Server Not Receiving Match Config

1. Check RCON password is correct
2. Verify server is accessible from internet
3. Check MatchZy is installed and running
4. Look at server console for errors

### Webhooks Not Working

1. Ensure your panel is publicly accessible
2. Check MatchZy has the correct webhook URL
3. Verify API key matches between panel and server

## Development

### Project Structure

```
get5panel/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and configurations
│   └── styles/          # Global styles
├── prisma/
│   └── schema.prisma    # Database schema
├── public/              # Static assets
└── package.json         # Dependencies
```

### Adding New Features

1. Update Prisma schema if needed
2. Run `npm run db:push` to update database
3. Create new API routes in `src/app/api/`
4. Add UI components in `src/components/`

## Support

For issues with:
- **MatchZy Plugin**: https://github.com/shobhit-pathak/MatchZy
- **Panel Issues**: Create an issue in your GitHub repo
- **CS2 Server**: Check MatchZy documentation

## License

MIT

## Credits

- MatchZy by shobhit-pathak
- Based on Get5 concepts
- Built with Next.js, Prisma, and Tailwind CSS

---

**Note**: This panel is compatible with MatchZy's Get5 compatibility mode. Make sure your MatchZy installation is up to date for best compatibility.
