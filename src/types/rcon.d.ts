declare module 'rcon' {
  class Rcon {
    constructor(host: string, port: number, password: string, timeout?: number)
    connect(): void
    send(command: string, callback: (err: Error | null, res: string) => void): void
    disconnect(): void
    on(event: 'auth' | 'response' | 'error' | 'end', callback: (...args: any[]) => void): this
    once(event: 'auth' | 'response' | 'error' | 'end', callback: (...args: any[]) => void): this
  }
  export default Rcon
}
