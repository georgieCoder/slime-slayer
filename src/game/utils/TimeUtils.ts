export class TimeUtils {
    static getMillisecsFromSecs(seconds: number): number {
        return seconds * 1000
    }
    
    static getMillisecFromMins(minutes: number): number {
        return this.getMillisecsFromSecs(minutes * 60)
    }

    static getSecsFromMillisecs(milliseconds: number): number {
        return milliseconds / 1000;
    }
}