export interface PresignedUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  storagePath: string;
  expiresInSeconds: number;
  headers?: Record<string, string>;
}

export interface IStorageProvider {
  getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder?: string
  ): Promise<PresignedUploadResponse>;
  deleteFile(storagePath: string): Promise<boolean>;
}

export class LocalStorageAdapter implements IStorageProvider {
  async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder: string = 'docs'
  ): Promise<PresignedUploadResponse> {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${folder}/${timestamp}_${sanitizedFileName}`;
    const publicUrl = `/${storagePath}`;

    // Return a mock presigned upload URL endpoint
    return {
      uploadUrl: `/api/upload/mock-upload?path=${encodeURIComponent(storagePath)}`,
      publicUrl,
      storagePath,
      expiresInSeconds: 900, // 15 minutes
      headers: {
        'Content-Type': mimeType,
      },
    };
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    console.log(`[LocalStorageAdapter] Delete requested for ${storagePath}`);
    return true;
  }
}

export class S3StorageAdapter implements IStorageProvider {
  private bucketName: string;

  constructor(bucketName: string = process.env.S3_BUCKET_NAME || 'nannies-for-hire-uploads') {
    this.bucketName = bucketName;
  }

  async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder: string = 'docs'
  ): Promise<PresignedUploadResponse> {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folder}/${timestamp}_${sanitizedFileName}`;
    const publicUrl = `https://${this.bucketName}.s3.ca-central-1.amazonaws.com/${storagePath}`;

    return {
      uploadUrl: `https://${this.bucketName}.s3.ca-central-1.amazonaws.com/${storagePath}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MOCK`,
      publicUrl,
      storagePath,
      expiresInSeconds: 900,
      headers: {
        'Content-Type': mimeType,
      },
    };
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    console.log(`[S3StorageAdapter] S3 Delete requested for ${storagePath}`);
    return true;
  }
}

// Export singleton instance based on environment
export const storageAdapter: IStorageProvider =
  process.env.STORAGE_PROVIDER === 's3' ? new S3StorageAdapter() : new LocalStorageAdapter();
