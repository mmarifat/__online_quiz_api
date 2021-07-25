import { DeleteStatusEnum } from '../enum/delete-status.enum';

const isNotDeletedQuery = { isDeleted: DeleteStatusEnum.disabled };

export default isNotDeletedQuery;
