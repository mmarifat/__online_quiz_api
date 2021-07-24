import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseService } from '../../../package/services/response.service';
import { UserQuizTestLogService } from '../services/user-quiz-test-log.service';

@ApiTags('user-quiz-test')
@ApiBearerAuth()
@Controller('user-quiz-test')
export class UserQuizTestLogController {
  constructor(
    private userQuizTestLogService: UserQuizTestLogService,
    private readonly responseService: ResponseService,
  ) {}
}
