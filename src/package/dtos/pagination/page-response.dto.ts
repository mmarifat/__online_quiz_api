import { PageDto } from './page.dto';

export class PageResponseDto extends PageDto {
  constructor(
    public page: number = 0,
    public limit: number = 10,
    public count: number = 0,
    public data: any = [] || {},
  ) {
    super(page, limit);
  }
}
