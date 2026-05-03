import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ErrorsInterceptor', {
    timestamp: true,
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        this.logger.error(err.message ?? err);

        if (err instanceof HttpException) return throwError(() => err);

        return throwError(
          () =>
            new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }),
    );
  }
}
