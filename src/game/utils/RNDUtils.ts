export class RNDUtils {
    static getRandomInRangeExcluding(min: number, max: number, exclude: number[]): number {
        const available = Array.from({ length: max - min + 1 }, (_, i) => i + min)
            .filter(num => !exclude.includes(num));

        if (available.length === 0) return min;

        return available[Math.floor(Math.random() * available.length)];
    }  
}