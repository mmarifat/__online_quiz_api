import { DeleteStatusEnum } from '../enum/delete-status.enum';

const isDeletedQuery = { isDeleted: DeleteStatusEnum.enabled };

export default isDeletedQuery;
