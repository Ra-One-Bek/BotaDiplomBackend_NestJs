import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

type MlPredictResponse = {
  predictedDirection: string;
  confidence: number;
  probabilities: Record<string, number>;
  modelVersion: string;
};

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);
  private readonly mlBaseUrl =
    process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';

  async predict(payload: {
    rawScores: Record<string, number>;
    topDirectionFromRules?: string;
  }): Promise<MlPredictResponse> {
    try {
      this.logger.log(`ML request -> ${this.mlBaseUrl}/predict`);

      const response = await axios.post(
        `${this.mlBaseUrl}/predict`,
        {
          rawScores: payload.rawScores,
          topDirectionFromRules: payload.topDirectionFromRules ?? null,
        },
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `ML response <- predictedDirection=${response.data?.predictedDirection}, confidence=${response.data?.confidence}`,
      );

      return {
        predictedDirection:
          response.data?.predictedDirection ??
          payload.topDirectionFromRules ??
          'unknown',
        confidence: Number(response.data?.confidence ?? 0),
        probabilities:
          (response.data?.probabilities as Record<string, number>) ?? {},
        modelVersion: response.data?.modelVersion ?? 'unknown',
      };
    } catch (error: any) {
      this.logger.error(`ML service error: ${error?.message || 'Unknown error'}`);

      if (error?.response) {
        this.logger.error(`ML response status: ${error.response.status}`);
        this.logger.error(
          `ML response data: ${JSON.stringify(error.response.data)}`,
        );
      }

      return {
        predictedDirection: payload.topDirectionFromRules ?? 'unknown',
        confidence: 0,
        probabilities: {},
        modelVersion: 'fallback-no-ml',
      };
    }
  }
}