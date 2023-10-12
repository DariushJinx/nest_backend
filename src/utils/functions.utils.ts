import { join } from 'path';

export class FunctionUtils {
  public static RandomNumberGenerator(): number {
    return ~~(Math.random() * 90000 + 10000);
  }

  public static ListOfImagesForRequest(
    files: Express.Multer.File[],
    fileUploadPath: string,
  ) {
    if (files) {
      return files
        .map((file) => join('/', fileUploadPath, file.filename))
        .map((item) => item.replace(/\\/g, '/'));
    } else {
      return [];
    }
  }
}
