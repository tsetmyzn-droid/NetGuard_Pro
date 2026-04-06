// rateLimiter.ts

// A basic rate limiting implementation to prevent brute force attacks

class RateLimiter {
    private requestCount: Map<string, number>;
    private timestamps: Map<string, number>;
    private readonly limit: number;
    private readonly interval: number;

    constructor(limit: number, interval: number) {
        this.requestCount = new Map();
        this.timestamps = new Map();
        this.limit = limit;
        this.interval = interval;
    }

    isAllowed(ip: string): boolean {
        const currentTime = Date.now();
        const count = this.requestCount.get(ip) || 0;
        const timestamp = this.timestamps.get(ip) || 0;

        if (currentTime - timestamp > this.interval) {
            this.requestCount.set(ip, 1);
            this.timestamps.set(ip, currentTime);
            return true;
        }

        if (count < this.limit) {
            this.requestCount.set(ip, count + 1);
            return true;
        }

        return false;
    }
}

export default RateLimiter;

// Example Usage
// const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
// console.log(rateLimiter.isAllowed(request.ip));