import { Controller, Post, Body } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  presign(@Body() body: { filename: string; mimeType: string }) {
    return this.uploadsService.getPresignedUrl(body.filename, body.mimeType);
  }
}
