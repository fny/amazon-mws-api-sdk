import { amazonMarketplaces, HttpClient, ParsingError } from '../../src'
import { MWS } from '../../src/mws'
import { NextToken } from '../../src/parsing'
import { getFixture } from '../utils'

const httpConfig = {
  awsAccessKeyId: '',
  marketplace: amazonMarketplaces.CA,
  mwsAuthToken: '',
  secretKey: '',
  sellerId: '',
}

const headers = {
  'x-mws-request-id': '0',
  'x-mws-timestamp': '2020-05-06T09:22:23.582Z',
  'x-mws-quota-max': '1000',
  'x-mws-quota-remaining': '999',
  'x-mws-quota-resetson': '2020-04-06T10:22:23.582Z',
}

const parsingError = 'Expected an object, but received a string with value ""'

const createMockHttpClient = (fixture: string) =>
  new MWS(
    new HttpClient(httpConfig, () =>
      Promise.resolve({
        data: getFixture(fixture),
        headers,
      }),
    ),
  )

const mockMwsServiceStatus = createMockHttpClient('get_service_status')

const mockMwsFail = new MWS(
  new HttpClient(httpConfig, () => Promise.resolve({ data: '', headers: {} })),
)

const mockRequestReport = createMockHttpClient('reports_request_report')
const mockGetReportRequestList = createMockHttpClient('reports_get_report_request_list')
const mockGetReportRequestListByNextToken = createMockHttpClient(
  'reports_get_report_request_list_by_next_token',
)

describe('reports', () => {
  describe('getReportRequestListByNextToken', () => {
    const mockNextToken = new NextToken('GetReportRequestListByNextToken', '123')
    const parameters = {
      NextToken: mockNextToken,
    }

    it('returns report request info if succesful', async () => {
      expect.assertions(1)

      expect(
        await mockGetReportRequestListByNextToken.reports.getReportRequestListByNextToken(
          parameters,
        ),
      ).toMatchSnapshot()
    })

    it("throws a parsing error when the response isn't valid", async () => {
      expect.assertions(1)

      await expect(() =>
        mockMwsFail.reports.getReportRequestListByNextToken(parameters),
      ).rejects.toStrictEqual(new ParsingError(parsingError))
    })
  })

  describe('getReportRequestList', () => {
    const parameters = {}

    it('returns report request info if succesful', async () => {
      expect.assertions(1)

      expect(
        await mockGetReportRequestList.reports.getReportRequestList(parameters),
      ).toMatchSnapshot()
    })

    it('throws a parsing error when the response is not valid', async () => {
      expect.assertions(1)

      await expect(() =>
        mockMwsFail.reports.getReportRequestList(parameters),
      ).rejects.toStrictEqual(new ParsingError(parsingError))
    })
  })

  describe('requestReport', () => {
    const parameters = {
      ReportType: '',
    }

    it('returns a parsed model when the response is valid', async () => {
      expect.assertions(1)

      expect(await mockRequestReport.reports.requestReport(parameters)).toMatchSnapshot()
    })

    it('throws a parsing error when the response is not valid', async () => {
      expect.assertions(1)

      await expect(() => mockMwsFail.reports.requestReport(parameters)).rejects.toStrictEqual(
        new ParsingError(parsingError),
      )
    })
  })

  describe('getServiceStatus', () => {
    it('returns a parsed model when the status response is valid', async () => {
      expect.assertions(1)

      expect(await mockMwsServiceStatus.reports.getServiceStatus()).toMatchSnapshot()
    })

    it('throws a parsing error when the status response is not valid', async () => {
      expect.assertions(1)

      await expect(() => mockMwsFail.reports.getServiceStatus()).rejects.toStrictEqual(
        new ParsingError(parsingError),
      )
    })
  })
})
