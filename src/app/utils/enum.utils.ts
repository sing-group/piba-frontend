export class EnumUtils {
    public findKeyForValue(enumType: any, value: string): string {
        return this.enumKeys(enumType).find((key: string) => enumType[key] == value);
    }

    public enumKeys<T>(enumType: any): string[] {
        return <string[]>(<any>Object.keys(enumType));
    }

    public enumValues<T>(enumType: any): T[] {
        return <T[]>(<any>Object.keys(enumType)).map((key: string) => enumType[key]);
    }



}