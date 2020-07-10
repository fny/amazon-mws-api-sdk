import { CreateInboundShipmentParameters, InboundShipmentHeader, ParsingError } from '../../src'
import { createMockHttpClient, mockMwsFail, mockMwsServiceStatus, parsingError } from '../utils'

function mockFunctions() {
  /**
   * Mock everything in purify-ts, restore it back to normal,
   *  except for `enumeration` which will be stubbed to accept
   * https://github.com/facebook/jest/issues/936#issuecomment-265074320
   */
  const original = jest.requireActual('purify-ts')

  return {
    ...original, // Pass down all the exported objects
    enumeration: <T extends Record<string, string | number>>(enumeration: T) => {
      const enumValues = Object.values(enumeration)

      return original.Codec.custom({
        decode: (input: string | number) => {
          if (typeof input !== 'string' && typeof input !== 'number') {
            return original.Left(`Expected enum, received ${input}`)
          }

          const enumIndex = enumValues.indexOf(input)

          return enumIndex !== -1 || input === 'String'
            ? original.Right((enumValues[enumIndex] as T[keyof T]) || 'String')
            : original.Left(`Expected enum, received ${input}`)
        },
        encode: original.identity,
        schema: () => ({ enum: enumValues }),
      })
    },
  }
}
jest.mock('purify-ts', () => mockFunctions())

const mockAddress = {
  Name: '',
  AddressLine1: '',
  Email: '',
  City: '',
  PostalCode: '',
  CountryCode: '',
  Phone: '',
}

const mockInboundShipmentItem = {
  SellerSKU: '',
  QuantityShipped: 1,
}

const mockInboundShipmentHeader: InboundShipmentHeader = {
  ShipmentName: '',
  ShipFromAddress: mockAddress,
  DestinationFulfillmentCenterId: '',
  LabelPrepPreference: 'SELLER_LABEL',
  ShipmentStatus: 'WORKING',
}

describe('fulfillmentInboundShipment', () => {
  describe('updateInboundShipment', () => {
    const parameters = {
      ShipmentId: '',
      InboundShipmentHeader: mockInboundShipmentHeader,
      InboundShipmentItems: [mockInboundShipmentItem],
    }

    it('return the shipment id if succesful', async () => {
      expect.assertions(1)

      const mockUpdateInboundShipment = createMockHttpClient(
        'fulfillment_inbound_shipment_update_inbound_shipment',
      )

      expect(
        await mockUpdateInboundShipment.fulfillmentInboundShipment.updateInboundShipment(
          parameters,
        ),
      ).toMatchSnapshot()
    })

    it("throws a parsing error when the status response isn't valid", async () => {
      expect.assertions(1)

      await expect(() =>
        mockMwsFail.fulfillmentInboundShipment.updateInboundShipment(parameters),
      ).rejects.toStrictEqual(new ParsingError(parsingError))
    })
  })

  describe('createInboundShipment', () => {
    const parameters: CreateInboundShipmentParameters = {
      ShipmentId: '',
      InboundShipmentHeader: mockInboundShipmentHeader,
      InboundShipmentItems: [mockInboundShipmentItem],
    }

    it('returns the shipment ID if succesful', async () => {
      expect.assertions(1)

      const mockCreateInboundShipment = createMockHttpClient(
        'fulfillment_inbound_shipment_create_inbound_shipment',
      )

      expect(
        await mockCreateInboundShipment.fulfillmentInboundShipment.createInboundShipment(
          parameters,
        ),
      ).toMatchSnapshot()
    })

    it("throws a parsing error when the status response isn't valid", async () => {
      expect.assertions(1)

      await expect(() =>
        mockMwsFail.fulfillmentInboundShipment.createInboundShipment(parameters),
      ).rejects.toStrictEqual(new ParsingError(parsingError))
    })
  })

  describe('createInboundShipmentPlan', () => {
    const mockInboundShipmentPlanRequestItem = {
      SellerSKU: '',
      Quantity: 1,
    }

    const parameters = {
      ShipFromAddress: mockAddress,
      InboundShipmentPlanRequestItems: [mockInboundShipmentPlanRequestItem],
    }

    it('returns inbound shipment plans if succesful', async () => {
      expect.assertions(1)

      const mockCreateInboundShipmentPlan = createMockHttpClient(
        'fulfillment_inbound_shipment_create_inbound_shipment_plan',
      )

      expect(
        await mockCreateInboundShipmentPlan.fulfillmentInboundShipment.createInboundShipmentPlan(
          parameters,
        ),
      ).toMatchSnapshot()
    })

    it('throws a parsing error when the status response isnt valid', async () => {
      expect.assertions(1)

      await expect(() =>
        mockMwsFail.fulfillmentInboundShipment.createInboundShipmentPlan(parameters),
      ).rejects.toStrictEqual(new ParsingError(parsingError))
    })
  })

  describe('getInboundGuidanceForAsin', () => {
    const parameters = {
      ASINList: [],
      MarketplaceId: '',
    }

    it('returns sku inbound guidance list if succesful', async () => {
      expect.assertions(1)

      const mockGetInboundGuidanceForSku = createMockHttpClient(
        'fulfillment_inbound_shipment_get_inbound_guidance_for_asin',
      )

      expect(
        await mockGetInboundGuidanceForSku.fulfillmentInboundShipment.getInboundGuidanceForAsin(
          parameters,
        ),
      ).toMatchSnapshot()
    })

    it('throws a parsing error when the status response isnt valid', async () => {
      expect.assertions(1)

      await expect(() =>
        mockMwsFail.fulfillmentInboundShipment.getInboundGuidanceForAsin(parameters),
      ).rejects.toStrictEqual(new ParsingError(parsingError))
    })
  })

  describe('getInboundGuidanceForSku', () => {
    const parameters = {
      SellerSKUList: [],
      MarketplaceId: '',
    }

    it('returns sku inbound guidance list if succesful', async () => {
      expect.assertions(1)

      const mockGetInboundGuidanceForSku = createMockHttpClient(
        'fulfillment_inbound_shipment_get_inbound_guidance_for_sku',
      )

      expect(
        await mockGetInboundGuidanceForSku.fulfillmentInboundShipment.getInboundGuidanceForSku(
          parameters,
        ),
      ).toMatchSnapshot()
    })

    it('throws a parsing error when the status response is not valid', async () => {
      expect.assertions(1)

      await expect(() =>
        mockMwsFail.fulfillmentInboundShipment.getInboundGuidanceForSku(parameters),
      ).rejects.toStrictEqual(new ParsingError(parsingError))
    })
  })

  describe('getServiceStatus', () => {
    it('returns a parsed model when the status response is valid', async () => {
      expect.assertions(1)

      expect(
        await mockMwsServiceStatus.fulfillmentInboundShipment.getServiceStatus(),
      ).toMatchSnapshot()
    })

    it('throws a parsing error when the status response is not valid', async () => {
      expect.assertions(1)

      await expect(() =>
        mockMwsFail.fulfillmentInboundShipment.getServiceStatus(),
      ).rejects.toStrictEqual(new ParsingError(parsingError))
    })
  })
})
