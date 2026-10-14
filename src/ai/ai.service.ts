import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private model: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.api_key')!;
    const model = this.configService.get<string>('gemini.model')!;

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model });
  }

  async processFile(
    prompt: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const result = await this.model.generateContent([
      prompt,
      {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      },
    ]);

    return result.response.text().trim();
  }
}
