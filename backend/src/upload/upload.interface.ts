export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

export type UploadEntity = 'produk' | 'resi' | 'ktp' | 'skck' | 'profile' | 'komplain';