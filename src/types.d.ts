// почему-то ide не видит метод add, поэтому декларирую интерфейс
interface FontFaceSet {
  readonly ready: Promise<FontFaceSet>;
  add(font: FontFace): void;
  check(font: string, text?: string): boolean;
  delete(font: FontFace): void;
  load(font: string, text?: string): Promise<FontFace[]>;
}
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.webp';
declare module '*.woff2';
declare module '*.ttf';