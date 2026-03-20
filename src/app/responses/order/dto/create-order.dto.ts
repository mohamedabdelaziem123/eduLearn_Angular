import { IOrder } from "../../interfaces";
import { EntityId } from "../../types";


export class CreateOrderDto implements Partial<IOrder> {
 
}

export interface CreateOrderParamsDto {

  orderId: EntityId;
}
