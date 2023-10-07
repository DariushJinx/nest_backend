export class FunctionUtils {
  public static RandomNumberGenerator(): number {
    return ~~(Math.random() * 90000 + 10000);
  }
}
