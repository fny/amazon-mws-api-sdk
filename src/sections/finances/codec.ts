import { Codec, enumeration, GetType, oneOf, optional, string, unknown } from 'purify-ts'

import { ensureArray, ensureInt, mwsDate, nextToken as nextTokenCodec } from '../../parsing'
import { CurrencyAmount } from '../codec'
import { FulfillmentChannelEnum } from '../types'

export enum ProcessingStatusEnum {
  Open = 'Open',
  Closed = 'Closed',
}

const ProcessingStatus = enumeration(ProcessingStatusEnum)

const FinancialEventGroup = Codec.interface({
  FinancialEventGroupId: optional(string),
  ProcessingStatus: optional(ProcessingStatus),
  FundTransferStatus: optional(string),
  OriginalTotal: optional(CurrencyAmount),
  ConvertedTotal: optional(CurrencyAmount),
  FundTransferDate: optional(mwsDate),
  TraceId: optional(string),
  AccountTail: optional(string),
  BeginningBalance: optional(CurrencyAmount),
  FinancialEventGroupStart: optional(mwsDate),
  FinancialEventGroupEnd: optional(mwsDate),
})

export const ListFinancialEventGroups = Codec.interface({
  NextToken: optional(nextTokenCodec('ListFinancialEventGroups')),
  FinancialEventGroupList: ensureArray('FinancialEventGroup', FinancialEventGroup),
})

export type ListFinancialEventGroups = GetType<typeof ListFinancialEventGroups>

export const ListFinancialEventGroupsResponse = Codec.interface({
  ListFinancialEventGroupsResponse: Codec.interface({
    ListFinancialEventGroupsResult: ListFinancialEventGroups,
  }),
})

export const ListFinancialEventGroupsByNextTokenResponse = Codec.interface({
  ListFinancialEventGroupsByNextTokenResponse: Codec.interface({
    ListFinancialEventGroupsByNextTokenResult: ListFinancialEventGroups,
  }),
})

/**
 * Previously had a huge enum of all available fee types but Amazon's
 * sample request contains <FeeType>ShippingChargeback</FeeType> which was not available
 * in their docs. I'm not sure what other FeeType could be missing from their docs
 */
const FeeType = string

const FeeComponent = Codec.interface({
  FeeType: optional(FeeType),
  FeeAmount: optional(CurrencyAmount),
})

export enum ChargeTypeEnum {
  Principal = 'Principal',
  Tax = 'Tax',
  'MarketplaceFacilitatorTax-Principal' = 'MarketplaceFacilitatorTax-Principal',
  'MarketplaceFacilitatorTax-Shipping' = 'MarketplaceFacilitatorTax-Shipping',
  'MarketplaceFacilitatorTax-GiftWrap' = 'MarketplaceFacilitatorTax-GiftWrap',
  'MarketplaceFacilitatorTax-Other' = 'MarketplaceFacilitatorTax-Other',
  Discount = 'Discount',
  TaxDiscount = 'TaxDiscount',
  CODItemCharge = 'CODItemCharge',
  CODItemTaxCharge = 'CODItemTaxCharge',
  CODOrderCharge = 'CODOrderCharge',
  CODOrderTaxCharge = 'CODOrderTaxCharge',
  CODShippingCharge = 'CODShippingCharge',
  CODShippingTaxCharge = 'CODShippingTaxCharge',
  ShippingCharge = 'ShippingCharge',
  ShippingTax = 'ShippingTax',
  Goodwill = 'Goodwill',
  GiftWrap = 'GiftWrap',
  GiftWrapTax = 'GiftWrapTax',
  RestockingFee = 'RestockingFee',
  ReturnShipping = 'ReturnShipping',
  PointsFee = 'PointsFee',
  GenericDeduction = 'GenericDeduction',
  FreeReplacementReturnShipping = 'FreeReplacementReturnShipping',
  PaymentMethodFee = 'PaymentMethodFee',
  ExportCharge = 'ExportCharge',
  'SAFE-TReimbursement' = 'SAFE-TReimbursement',
  'TCS-CGST' = 'TCS-CGST',
  'TCS-SGST' = 'TCS-SGST',
  'TCS-IGST' = 'TCS-IGST',
  'TCS-UTGST' = 'TCS-UTGST',
}

const ChargeType = enumeration(ChargeTypeEnum)

const ChargeComponent = Codec.interface({
  ChargeType: optional(ChargeType),
  ChargeAmount: optional(CurrencyAmount),
})

export enum DirectPaymentTypeEnum {
  StoredValueCardRevenue = 'StoredValueCardRevenue',
  StoredValueCardRefund = 'StoredValueCardRefund',
  PrivateLabelCreditCardRevenue = 'PrivateLabelCreditCardRevenue',
  PrivateLabelCreditCardRefund = 'PrivateLabelCreditCardRefund',
  CollectOnDeliveryRevenue = 'CollectOnDeliveryRevenue',
  CollectOnDeliveryRefund = 'CollectOnDeliveryRefund',
}

const DirectPaymentType = enumeration(DirectPaymentTypeEnum)

const DirectPayment = Codec.interface({
  DirectPaymentType: optional(DirectPaymentType),
  DirectPaymentAmount: optional(CurrencyAmount),
})

export enum TaxCollectionModelEnum {
  MarketplaceFacilitator = 'MarketplaceFacilitator',
  Standard = 'Standard',
}

const TaxCollectionModel = enumeration(TaxCollectionModelEnum)

const TaxWithheldComponent = Codec.interface({
  TaxCollectionModel: optional(TaxCollectionModel),
  TaxesWithheld: optional(ensureArray('ChargeComponent', ChargeComponent)),
})

const Promotion = Codec.interface({
  PromotionType: optional(string),
  PromotionId: optional(string),
  PromotionAmount: optional(CurrencyAmount),
})

const ShipmentItem = Codec.interface({
  SellerSKU: optional(string),
  OrderItemId: optional(string),
  OrderAdjustmentItemId: optional(string),
  QuantityShipped: optional(ensureInt),
  ItemChargeList: optional(ensureArray('ChargeComponent', ChargeComponent)),
  ItemTaxWithheldList: optional(ensureArray('TaxWithheldComponent', TaxWithheldComponent)),
  ItemChargeAdjustmentList: optional(ensureArray('ChargeComponent', ChargeComponent)),
  ItemFeeList: optional(ensureArray('FeeComponent', FeeComponent)),
  ItemFeeAdjustmentList: optional(ensureArray('FeeComponent', FeeComponent)),
  PromotionList: optional(ensureArray('Promotion', Promotion)),
  PromotionAdjustmentList: optional(ensureArray('Promotion', Promotion)),
  CostOfPointsGranted: optional(CurrencyAmount),
  CostOfPointsReturned: optional(CurrencyAmount),
})

const ShipmentEvent = Codec.interface({
  AmazonOrderId: optional(string),
  SellerOrderId: optional(string),
  MarketplaceName: optional(string),
  OrderChargeList: optional(ensureArray('ChargeComponent', ChargeComponent)),
  OrderChargeAdjustmentList: optional(ensureArray('ChargeComponent', ChargeComponent)),
  ShipmentFeeList: optional(ensureArray('FeeComponent', FeeComponent)),
  ShipmentFeeAdjustmentList: optional(ensureArray('FeeComponent', FeeComponent)),
  OrderFeeList: optional(ensureArray('FeeComponent', FeeComponent)),
  OrderFeeAdjustmentList: optional(ensureArray('FeeComponent', FeeComponent)),
  DirectPaymentList: optional(ensureArray('DirectPayment', DirectPayment)),
  PostedDate: optional(mwsDate),
  ShipmentItemList: optional(ensureArray('ShipmentItem', ShipmentItem)),
  ShipmentItemAdjustmentList: optional(ensureArray('ShipmentItem', ShipmentItem)),
})
const RefundEvent = ShipmentEvent
const GuaranteeClaimEvent = ShipmentEvent
const ChargebackEvent = ShipmentEvent

const FulfillmentChannel = enumeration(FulfillmentChannelEnum)

const PayWithAmazonEvent = Codec.interface({
  SellerOrderId: optional(string),
  TransactionPostedDate: optional(mwsDate),
  BusinessObjectType: optional(string),
  SalesChannel: optional(string),
  Charge: optional(ChargeComponent),
  FeeList: optional(ensureArray('FeeComponent', FeeComponent)),
  PaymentAmountType: optional(string),
  AmountDescription: optional(string),
  FulfillmentChannel: optional(FulfillmentChannel),
  StoreName: optional(string),
})

export enum ProviderTransactionTypeEnum {
  ProviderCredit = 'ProviderCredit',
  ProviderCreditReversal = 'ProviderCreditReversal',
}

const ProviderTransactionType = enumeration(ProviderTransactionTypeEnum)

const SolutionProviderCreditEvent = Codec.interface({
  ProviderTransactionType: optional(ProviderTransactionType),
  SellerOrderId: optional(string),
  MarketplaceId: optional(string),
  MarketplaceCountryCode: optional(string),
  SellerId: optional(string),
  SellerStoreName: optional(string),
  ProviderId: optional(string),
  ProviderStoreName: optional(string),
})

export enum RetrochargeEventTypeEnum {
  Retrocharge = 'Retrocharge',
  RetrochargeReversal = 'RetrochargeReversal',
}

const RetrochargeEventType = enumeration(RetrochargeEventTypeEnum)

const RetrochargeEvent = Codec.interface({
  RetrochargeEventType: optional(RetrochargeEventType),
  AmazonOrderId: optional(string),
  PostedDate: optional(mwsDate),
  BaseTax: optional(CurrencyAmount),
  ShippingTax: optional(CurrencyAmount),
  MarketplaceName: optional(string),
  RetrochargeTaxWithheldComponentList: optional(
    ensureArray('TaxWithheldComponent', TaxWithheldComponent),
  ),
})

export enum RentalEventTypeEnum {
  'RentalCustomerPayment-Buyout' = 'RentalCustomerPayment-Buyout',
  'RentalCustomerPayment-Extension' = 'RentalCustomerPayment-Extension',
  'RentalCustomerRefund-Buyout' = 'RentalCustomerRefund-Buyout',
  'RentalCustomerRefund-Extension' = 'RentalCustomerRefund-Extension',
  RentalHandlingFee = 'RentalHandlingFee',
  RentalChargeFailureReimbursement = 'RentalChargeFailureReimbursement',
  RentalLostItemReimbursement = 'RentalLostItemReimbursement',
}

const RentalEventType = enumeration(RentalEventTypeEnum)

const RentalTransactionEvent = Codec.interface({
  AmazonOrderId: optional(string),
  RentalEventType: optional(RentalEventType),
  ExtensionLength: optional(ensureInt),
  PostedDate: optional(mwsDate),
  RentalChargeList: optional(ensureArray('ChargeComponent', ChargeComponent)),
  RentalFeeList: optional(ensureArray('FeeComponent', FeeComponent)),
  MarketplaceName: optional(string),
  RentalInitialValue: optional(CurrencyAmount),
  RentalReimbursement: optional(CurrencyAmount),
  RentalTaxWithheldList: optional(TaxWithheldComponent),
})
/**
 * Leaving this as unknown because Amazon did not define it in their
 */
const PerformanceBondRefundEvent = unknown

/**
 * Not sure what case MWS returns. Sample requests has them captialized but docs has them in lower case
 */
export enum transactionTypeEnum {
  charge = 'charge',
  refund = 'refund',
  Charge = 'Charge',
  Refund = 'Refund',
}

const transactionType = enumeration(transactionTypeEnum)

/**
 * For some unknown reason this is in camel case
 */
const ProductAdsPaymentEvent = Codec.interface({
  postedDate: optional(mwsDate),
  transactionType: optional(transactionType),
  invoiceId: optional(string),
  baseValue: optional(CurrencyAmount),
  taxValue: optional(CurrencyAmount),
  transactionValue: optional(CurrencyAmount),
})

const ServiceFeeEvent = Codec.interface({
  AmazonOrderId: optional(string),
  FeeReason: optional(string),
  FeeList: optional(ensureArray('FeeComponent', FeeComponent)),
  SellerSKU: optional(string),
  FnSKU: optional(string),
  FeeDesription: optional(string),
  ASIN: optional(string),
})

const DebtRecoveryItem = Codec.interface({
  RecoveryAmount: optional(CurrencyAmount),
  OriginalAmount: optional(CurrencyAmount),
  GroupBeginDate: optional(mwsDate),
  GroupEndDate: optional(mwsDate),
})

const ChargeInstrument = Codec.interface({
  Description: optional(string),
  Tail: optional(string),
  Amount: optional(CurrencyAmount),
})

export enum DebtRecoveryTypeEnum {
  DebtPayment = 'DebtPayment',
  DebtPaymentFailure = 'DebtPaymentFailure',
  DebtAdjustment = 'DebtAdjustment',
}

const DebtRecoveryType = enumeration(DebtRecoveryTypeEnum)

const DebtRecoveryEvent = Codec.interface({
  DebtRecoveryType: optional(DebtRecoveryType),
  RecoveryAmount: optional(CurrencyAmount),
  OverPaymentCredit: optional(CurrencyAmount),
  DebtRecoveryItemList: optional(ensureArray('DebtRecoveryItem', DebtRecoveryItem)),
  ChargeInstrumentList: optional(ensureArray('ChargeInstrument', ChargeInstrument)),
})

export enum SourceBusinessEventTypeEnum {
  LoanAdvance = 'LoanAdvance',
  LoanPayment = 'LoanPayment',
  LoanRefund = 'LoanRefund',
}

const SourceBusinessEventType = enumeration(SourceBusinessEventTypeEnum)

const LoanServicingEvent = Codec.interface({
  LoanAmount: optional(CurrencyAmount),
  SourceBusinessEventType: optional(SourceBusinessEventType),
})

export enum AdjustmentTypeEnum {
  FBAInventoryReimbursement = 'FBAInventoryReimbursement',
  ReserveEvent = 'ReserveEvent',
  PostageBilling = 'PostageBilling',
  PostageBillingTransactionFee = 'PostageBilling_TransactionFee',
  PostageBillingInsurance = 'PostageBilling_Insurance',
  PostageBillingDeliveryConfirmation = 'PostageBilling_DeliveryConfirmation',
  PostageBillingPostage = 'PostageBilling_Postage',
  PostageRefund = 'PostageRefund',
  LostOrDamagedReimbursement = 'LostOrDamagedReimbursement',
  CanceledButPickedUpReimbursement = 'CanceledButPickedUpReimbursement',
  ReimbursementClawback = 'ReimbursementClawback',
  ReversalReimbursement = 'REVERSAL_REIMBURSEMENT',
  SellerRewards = 'SellerRewards',
  WAREHOUSE_DAMAGE = 'WAREHOUSE_DAMAGE',
}

const AdjustmentType = enumeration(AdjustmentTypeEnum)

const AdjustmentItem = Codec.interface({
  Quantity: optional(string), // Docs and mock responses list this as `string`
  PerUnitAmount: optional(CurrencyAmount),
  TotalAmount: optional(CurrencyAmount),
  SellerSKU: optional(string),
  FnSKU: optional(string),
  ProductDescription: optional(string),
  ASIN: optional(string),
})

const AdjustmentEvent = Codec.interface({
  AdjustmentType: optional(AdjustmentType),
  AdjustmentAmount: optional(CurrencyAmount),
  AdjustmentItemList: optional(ensureArray('AdjustmentItem', AdjustmentItem)),
  PostedDate: optional(mwsDate),
})

const CouponPaymentEvent = Codec.interface({
  PostedDate: optional(mwsDate),
  CouponId: optional(string),
  SellerCouponDescription: optional(string),
  ClipOrRedemptionCount: optional(ensureInt),
  PaymentEventId: optional(string),
  FeeComponent: optional(FeeComponent),
  ChargeComponent: optional(ChargeComponent),
  TotalAmount: optional(CurrencyAmount),
})

const SAFETReimbursementItem = Codec.interface({
  ItemChargeList: optional(ensureArray('ChargeComponent', ChargeComponent)),
})

const SAFETReimbursementEvent = Codec.interface({
  PostedDate: optional(mwsDate),
  SAFETClaimId: optional(string),
  ReimbursedAmount: optional(CurrencyAmount),
  SAFETReimbursementItemList: optional(
    ensureArray('SAFETReimbursementItem', SAFETReimbursementItem),
  ),
})

const SellerReviewEnrollmentPaymentEvent = Codec.interface({
  PostedDate: optional(mwsDate),
  EnrollmentId: optional(string),
  ParentASIN: optional(string),
  FeeComponent: optional(FeeComponent),
  ChargeComponent: optional(ChargeComponent),
  TotalAmount: optional(CurrencyAmount),
})

const FBALiquidationEvent = Codec.interface({
  PostedDate: optional(mwsDate),
  OriginalRemovalOrderId: optional(string),
  LiquidationProceedsAmount: optional(CurrencyAmount),
  LiquidationFeeAmount: optional(CurrencyAmount),
})

const ImagingServicesFeeEvent = Codec.interface({
  ImagingRequestBillingItemID: optional(string),
  ASIN: optional(string),
  PostedDate: optional(mwsDate),
  FeeList: optional(ensureArray('FeeComponent', FeeComponent)),
})

const AffordabilityExpenseEvent = Codec.interface({
  PostedDate: optional(mwsDate),
  TransactionType: optional(transactionType),
  AmazonOrderId: optional(string),
  BaseExpense: optional(CurrencyAmount),
  TotalExpense: optional(CurrencyAmount),
  TaxTypeIGST: optional(CurrencyAmount),
  TaxTypeCGST: optional(CurrencyAmount),
  TaxTypeSGST: optional(CurrencyAmount),
  MarketplaceId: optional(string),
})

const AffordabilityExpenseReversalEvent = Codec.interface({
  PostedDate: optional(mwsDate),
  TransactionType: optional(transactionType),
  AmazonOrderId: optional(string),
  BaseExpense: optional(CurrencyAmount),
  TotalExpense: optional(CurrencyAmount),
  TaxTypeIGST: optional(CurrencyAmount),
  TaxTypeCGST: optional(CurrencyAmount),
  TaxTypeSGST: optional(CurrencyAmount),
  MarketplaceId: optional(string),
})

export enum NetworkComminglingTransactionTypeEnum {
  ComminglingVAT = 'ComminglingVAT',
  NetCo = 'NetCo',
}

const NetworkComminglingTransactionType = enumeration(NetworkComminglingTransactionTypeEnum)

const NetworkComminglingTransactionEvent = Codec.interface({
  PostedDate: optional(mwsDate),
  NetCoTransactionID: optional(string),
  SwapReason: optional(string),
  TransactionType: optional(NetworkComminglingTransactionType),
  ASIN: optional(string),
  MarketplaceId: optional(string),
  TaxExclusiveAmount: optional(CurrencyAmount),
  TaxAmount: optional(CurrencyAmount),
})

const TDSReimbursementEvent = Codec.interface({
  PostedDate: optional(mwsDate),
  TdsOrderId: optional(string),
  ReimbursedAmount: optional(CurrencyAmount),
})
const FinancialEvents = Codec.interface({
  ShipmentEventList: optional(ensureArray('ShipmentEvent', ShipmentEvent)),
  RefundEventList: optional(ensureArray('ShipmentEvent', RefundEvent)),
  GuaranteeClaimEventList: optional(ensureArray('ShipmentEvent', GuaranteeClaimEvent)),
  ChargebackEventList: optional(ensureArray('ShipmentEvent', ChargebackEvent)),
  PayWithAmazonEventList: optional(ensureArray('PayWithAmazonEvent', PayWithAmazonEvent)),
  ServiceProviderCreditEventList: optional(
    ensureArray('SolutionProviderCreditEvent', SolutionProviderCreditEvent),
  ),
  RetrochargeEventList: optional(ensureArray('RetrochargeEvent', RetrochargeEvent)),
  RentalTransactionEventList: optional(
    ensureArray('RentalTransactionEvent', RentalTransactionEvent),
  ),
  PerformanceBondRefundEventList: optional(
    ensureArray('PerformanceBondRefundEvent', PerformanceBondRefundEvent),
  ),
  ProductAdsPaymentEventList: optional(
    ensureArray('ProductAdsPaymentEvent', ProductAdsPaymentEvent),
  ),
  ServiceFeeEventList: optional(ensureArray('ServiceFeeEvent', ServiceFeeEvent)),
  DebtRecoveryEventList: optional(ensureArray('DebtRecoveryEvent', DebtRecoveryEvent)),
  LoanServicingEventList: optional(ensureArray('LoanServicingEvent', LoanServicingEvent)),
  AdjustmentEventList: optional(ensureArray('AdjustmentEvent', AdjustmentEvent)),
  CouponPaymentEventList: optional(ensureArray('CouponPaymentEvent', CouponPaymentEvent)),
  SAFETReimbursementEventList: optional(
    ensureArray('SAFETReimbursementEvent', SAFETReimbursementEvent),
  ),
  SellerReviewEnrollmentPaymentEventList: optional(
    ensureArray('SellerReviewEnrollmentPaymentEvent', SellerReviewEnrollmentPaymentEvent),
  ),
  FBALiquidationEventList: optional(ensureArray('FBALiquidationEvent', FBALiquidationEvent)),
  ImagingServicesFeeEventList: optional(
    ensureArray('ImagingServicesFeeEvent', ImagingServicesFeeEvent),
  ),
  AffordabilityExpenseEventList: optional(
    ensureArray('AffordabilityExpenseEvent', AffordabilityExpenseEvent),
  ),
  /**
   * Mock response from C# lib names the members of this as `AffordabilityExpenseEvent` while
   * mock resposne from docs name the members as `AffordabilityExpenseEvent`. They're both the
   * object just with different names though
   */
  AffordabilityExpenseReversalEventList: oneOf([
    optional(ensureArray('AffordabilityExpenseEvent', AffordabilityExpenseEvent)),
    optional(ensureArray('AffordabilityExpenseReversalEvent', AffordabilityExpenseReversalEvent)),
  ]),
  NetworkComminglingTransactionEventList: optional(
    ensureArray('NetworkComminglingTransactionEvent', NetworkComminglingTransactionEvent),
  ),
  TDSReimbursementEventList: optional(ensureArray('TDSReimbursementEvent', TDSReimbursementEvent)),
})

export const ListFinancialEvents = Codec.interface({
  NextToken: optional(nextTokenCodec('ListFinancialEvents')),
  FinancialEvents,
})

export type ListFinancialEvents = GetType<typeof ListFinancialEvents>

export const ListFinancialEventsResponse = Codec.interface({
  ListFinancialEventsResponse: Codec.interface({
    ListFinancialEventsResult: ListFinancialEvents,
  }),
})

export const ListFinancialEventsByNextTokenResponse = Codec.interface({
  ListFinancialEventsByNextTokenResponse: Codec.interface({
    ListFinancialEventsByNextTokenResult: ListFinancialEvents,
  }),
})
