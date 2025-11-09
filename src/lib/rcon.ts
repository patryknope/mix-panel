import Rcon from 'rcon'

export interface ServerConfig {
  ip: string
  port: number
  rconPassword: string
}

export class RconConnection {
  private rcon: any
  private connected: boolean = false
  private config: ServerConfig

  constructor(config: ServerConfig) {
    this.config = config
    this.rcon = new Rcon(config.ip, config.port, config.rconPassword)
    
    this.rcon.on('auth', () => {
      this.connected = true
      console.log(`RCON authenticated to ${config.ip}:${config.port}`)
    })
    
    this.rcon.on('error', (err: any) => {
      console.error(`RCON error for ${config.ip}:${config.port}:`, err)
      this.connected = false
    })
    
    this.rcon.on('end', () => {
      console.log(`RCON connection closed to ${config.ip}:${config.port}`)
      this.connected = false
    })
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve()
        return
      }

      this.rcon.connect()
      
      const timeout = setTimeout(() => {
        reject(new Error('RCON connection timeout'))
      }, 5000)

      this.rcon.once('auth', () => {
        clearTimeout(timeout)
        resolve()
      })

      this.rcon.once('error', (err: any) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  }

  async send(command: string): Promise<string> {
    if (!this.connected) {
      await this.connect()
    }

    return new Promise((resolve, reject) => {
      this.rcon.send(command, (err: any, res: string) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }

  disconnect(): void {
    if (this.connected) {
      this.rcon.disconnect()
    }
  }
}

export async function sendRconCommand(
  server: ServerConfig,
  command: string
): Promise<string> {
  const rcon = new RconConnection(server)
  try {
    await rcon.connect()
    const response = await rcon.send(command)
    return response
  } finally {
    rcon.disconnect()
  }
}

// MatchZy specific commands
export const MatchZyCommands = {
  loadMatch: (configUrl: string) => `get5_loadmatch_url "${configUrl}"`,
  endMatch: () => 'get5_endmatch',
  pauseMatch: () => 'sm_pause',
  unpauseMatch: () => 'sm_unpause',
  getStatus: () => 'get5_status',
  listBackups: () => 'get5_listbackups',
  loadBackup: (file: string) => `get5_loadbackup "${file}"`,
  
  // MatchZy specific
  setApiKey: (key: string) => `get5_web_api_key "${key}"`,
  checkAvailable: () => 'get5_web_available',
}
