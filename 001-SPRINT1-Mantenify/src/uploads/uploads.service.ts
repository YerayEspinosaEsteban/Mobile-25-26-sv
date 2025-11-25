import { Injectable, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from 'src/config/config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private s3: S3Client;
  private bucket: string;

  constructor(@Inject(config.KEY) private cfg: ConfigType<typeof config>) {
    this.bucket = cfg.aws.bucket as string;
    this.s3 = new S3Client({
      region: cfg.aws.region,
      credentials: {
        accessKeyId: cfg.aws.accessKeyId as string,
        secretAccessKey: cfg.aws.secretAccessKey as string,
      },
    });
  }

  async getPresignedUrl(filename: string, mimeType: string) {
    const key = `thumbnails/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 });

    return { url, key };
  }
}
