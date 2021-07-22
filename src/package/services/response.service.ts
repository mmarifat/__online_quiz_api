import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseDto } from '../dtos/response/response.dto';
import { PayloadDto } from '../dtos/response/payload.dto';
import { PageResponseDto } from '../dtos/pagination/page-response.dto';
import { ErrorDto } from '../dtos/response/error.dto';
import { SystemErrorDto } from '../dtos/response/system-error.dto';
import { FieldErrorDto } from '../dtos/response/field-error.dto';

@Injectable()
export class ResponseService {
  toResponse<T>(status: HttpStatus, message: string, data: T): ResponseDto {
    const available =
      data instanceof Array ? data.length : data instanceof Object ? 1 : 0;

    const payload = new PayloadDto(available, data);
    return new ResponseDto(
      new Date().getTime(),
      status,
      message,
      null,
      payload,
    );
  }

  toDtoResponse<T>(status: HttpStatus, message: string, data: T): ResponseDto {
    const available = data ? 1 : 0;
    const payload = new PayloadDto(available, data);
    return new ResponseDto(
      new Date().getTime(),
      status,
      message,
      null,
      payload,
    );
  }

  toDtosResponse<T>(
    status: HttpStatus,
    message: string,
    data: T[],
  ): ResponseDto {
    const count = data instanceof Array ? data.length : 0;
    const payload = new PayloadDto(count, data);
    return new ResponseDto(
      new Date().getTime(),
      status,
      message,
      null,
      payload,
    );
  }

  toPaginationResponse<T>(
    status: HttpStatus,
    message: string,
    page: number,
    limit: number,
    data: [T[], number],
  ): ResponseDto {
    const [apiData, total] = data;

    const pageResponseDto = new PageResponseDto(page, limit, total, apiData);

    return new ResponseDto(
      new Date().getTime(),
      status,
      message,
      null,
      null,
      pageResponseDto,
    );
  }

  toErrorResponse(
    status: HttpStatus,
    message: string,
    error: any,
  ): ResponseDto {
    const fieldErrors = [];

    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        fieldErrors.push(
          new FieldErrorDto(
            `${key}`,
            error.errors[key].value,
            error.errors[key].message,
          ),
        );
      });
    }

    message = error.message ? error.message : message;

    let errorDto;
    if (fieldErrors.length > 0) {
      errorDto = new ErrorDto(fieldErrors, null);
    } else {
      const systemErrorDto = new SystemErrorDto('System', 'Error', message);
      errorDto = new ErrorDto(null, systemErrorDto);
    }

    const now = new Date().getTime();

    return new ResponseDto(now, status, message, errorDto, null);
  }
}
